const ENVIRONMENT = process.env.NODE_ENV || 'production'
const { readdirSync, writeFileSync, readFileSync, existsSync } = require('fs')
const path = require('path')
const ffprobe = require('ffprobe')
const ffprobeStatic = ENVIRONMENT === 'production' ? require('../utils/ffprobe-static') : require('ffprobe-static')
const short = require('short-uuid')

const { searchTv, getTv, getSeason, downloadImage } = require('./TmdbService')
const { Library, Series, Metadata, Season, Episode, Op } = require('../database/models')
const { VALID_EXTENSIONS } = require('../constants')
const logger = require('../logger')
const service = {}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function probe(path) {
  let info
  try {
    info = await ffprobe(path, { path: ffprobeStatic.path })
  } catch (err) {
    logger.error(`\t${err.message}`)
  }
  return info
}

async function findOrCreateSeason(seriesId, seriesPath, seasonDir, tmdbSeason) {
  let localPath
  const seasonNumber = getSeasonNumberFromSeasonDir(seasonDir)
  if (!tmdbSeason) {
    const series = await Series.findOne({
      where: { id: seriesId },
      include: [Metadata]
    })
    if (series.Metadatum) {
      tmdbSeason = await getSeason(series.Metadatum.tmdbId, seasonNumber)
    }
  }
  if (tmdbSeason) {
    localPath = await downloadImage(tmdbSeason.poster_path, 'w342')
  }

  const seasonRow = (await Season.findOrCreate({
    where: {
      seriesId,
      season: seasonNumber,
    },
    defaults: {
      seriesId,
      season: seasonNumber,
      path: `${seriesPath}/${seasonDir}`,
      tmdbId: tmdbSeason ? Number(tmdbSeason.id) : null,
      tmdb_poster_path: tmdbSeason ? tmdbSeason.poster_path : null,
      local_poster_path: localPath ? localPath.split('/').pop() : null
    }
  }))
  // if we are updating and not creating
  if (!seasonRow[1]) {
    seasonRow[0].path = `${seriesPath}/${seasonDir}`
    seasonRow[0].tmdbId = tmdbSeason ? tmdbSeason.id : null
    seasonRow[0].tmdb_poster_path = tmdbSeason ? tmdbSeason.poster_path : null
    seasonRow[0].local_poster_path = localPath ? localPath.split('/').pop() : null
    seasonRow[0].save()
  }
  return seasonRow[0]
}

function getSeasonNumberFromSeasonDir(seasonDir) {
  let tempSeasonNumber = seasonDir.toLowerCase()
  if (tempSeasonNumber.indexOf('special') >= 0 || tempSeasonNumber.indexOf('specials') >= 0)
    return 0
  else
    return Number(tempSeasonNumber.split(' ')[1])
}

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name).sort()

const getFiles = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => !dirent.isDirectory())
    .map(dirent => dirent.name)


service.addEpisode = (filename, series, seasonDirectoryName) => createEpisodeData(filename, series, seasonDirectoryName)

async function createEpisodeData(episode, series, seasonDir, tmdbSeasonMeta, wss) {
  const { ext } = path.parse(episode)
  if (VALID_EXTENSIONS.indexOf(ext) === -1) return // not a valid video file

  const seasonRow = await findOrCreateSeason(series.id, series.path, seasonDir, tmdbSeasonMeta)

  const seasonNumber = seasonRow.season

  const filenameNoExtension = path.parse(episode).name
  const seasonEpisodeParse = filenameNoExtension.match(/[sS]([0-9]+|[0-9]+)[eE]([0-9]+|[0-9]+)/)
  if (seasonEpisodeParse) {
    const episodeNumber = Number(seasonEpisodeParse[2])
    const episodeTitleSplit = filenameNoExtension.toLowerCase().split(` - ${seasonEpisodeParse[0].toLowerCase()} - `)
    let episodeTitle = ''
    if (episodeTitleSplit.length === 2) {
      episodeTitle = episodeTitleSplit[1]
    }


    if (!tmdbSeasonMeta && series.Metadatum) {
      tmdbSeasonMeta = await getSeason(series.Metadatum.tmdbId, seasonNumber)
    }

    const tmdbEpisodeData = tmdbSeasonMeta ? tmdbSeasonMeta.episodes.find((episode) => episode.episode_number === episodeNumber) : null

    let episodeRow = await Episode.findOne({
      where: {
        seasonId: seasonRow.id,
        episode_number: episodeNumber
      }
    })
    const stillPath = tmdbEpisodeData ? tmdbEpisodeData.still_path ? await downloadImage(tmdbEpisodeData.still_path, 'w300') : null : null
    if (!episodeRow) {
      await Episode.create({
        seriesId: series.id,
        seasonId: seasonRow.id,
        tmdbId: tmdbEpisodeData ? tmdbEpisodeData.id : null,
        filename: episode,
        path: `${series.path}/${seasonDir}/${episode}`,
        name: tmdbEpisodeData ? tmdbEpisodeData.name : null,
        overview: tmdbEpisodeData ? tmdbEpisodeData.overview : null,
        tmdb_still_path: tmdbEpisodeData ? tmdbEpisodeData.still_path : null,
        local_still_path: stillPath ? stillPath.split('/').pop() : null,
        air_date: tmdbEpisodeData ? tmdbEpisodeData.air_date : null,
        season_number: seasonNumber,
        episode_number: episodeNumber,
        tmdb_rating: tmdbEpisodeData ? tmdbEpisodeData.vote_average : null,
      })
      episodeRow = await Episode.findOne({
        where: { seasonId: seasonRow.id, episode_number: episodeNumber }
      })
    } else {
      episodeRow.seasonId = seasonRow.id
      episodeRow.tmdbId = tmdbEpisodeData ? tmdbEpisodeData.id : null
      episodeRow.filename = episode
      episodeRow.path = `${series.path}/${seasonDir}/${episode}`
      episodeRow.name = tmdbEpisodeData ? tmdbEpisodeData.name : null
      episodeRow.overview = tmdbEpisodeData ? tmdbEpisodeData.overview : null
      episodeRow.tmdb_still_path = tmdbEpisodeData ? tmdbEpisodeData.still_path : null
      episodeRow.local_still_path = stillPath ? stillPath.split('/').pop() : null
      episodeRow.air_date = tmdbEpisodeData ? tmdbEpisodeData.air_date : null
      episodeRow.season_number = seasonNumber
      episodeRow.tmdb_rating = tmdbEpisodeData ? tmdbEpisodeData.vote_average : null
      episodeRow.save()
    }

    // On main crawl, only probe non-existen. 
    // There will be a function later for refreshing probe data in case of file changes
    if (!episodeRow.file_probe_data) {
      logger.stream.write(`probing file data -- ${episode}`)
      if (wss) {
        wss.broadcast(`\tprobing file data -- ${episode}`)
      }
      try {
        const probeData = await probe(episodeRow.path)
        episodeRow.file_probe_data = probeData
        episodeRow.save()
      } catch (err) {
        logger.error(err)
      }
    }
  } else {
    logger.error(`\t\t\tUnable to parse episode: ${series.name} -- ${episode}`)
    if (wss) {
      wss.broadcast(`\t\t\tUnable to parse episode: ${series.name} -- ${episode}`)
    }
  }
}

/**
 * 
 * @param {*} seriesId 
 * @param {*} seasonData season data from tmdb (getTv(tmdbId))
 * @param {*} wss 
 */
const crawlSeasons = (seriesId, seasonData, wss) => new Promise(async (resolve, reject) => {
  try {
    const series = await Series.findOne({
      where: {
        id: seriesId
      },
      include: [Metadata]
    })
    const library = await Library.findByPk(series.libraryId)

    const seasonDirs = getDirectories(path.resolve(library.path, series.name))
    if (seasonDirs.length === 0) {
      if (wss) {
        wss.broadcast(`\t\tNo season data found for ${series.name}`)
      }
      logger.stream.write(`\t\tNo season data found for ${series.name}`)
    }
    for (let seasonDir of seasonDirs) {
      logger.stream.write(`\tchecking ${seasonDir}`)
      const episodeFiles = getFiles(path.resolve(library.path, series.name, seasonDir))
      logger.stream.write(`\tseason has ${episodeFiles.length} files at path: ${path.resolve(library.path, series.name, seasonDir)}`)

      const seasonNumber = getSeasonNumberFromSeasonDir(seasonDir)
      try {
        if (series.Metadatum) {
          let tmdbSeasonMeta
          try {
            tmdbSeasonMeta = await getSeason(series.Metadatum.tmdbId, seasonNumber)
          } catch (err) {
            logger.error(err)
          }
          const tmdbSeasonData = seasonData ? seasonData.find((s) => Number(s.season_number) === Number(seasonNumber)) : null
          const seasonRow = await findOrCreateSeason(series.id, series.path, seasonDir, tmdbSeasonData)
          for (let episode of episodeFiles) {
            await createEpisodeData(episode, series, seasonDir, tmdbSeasonMeta, wss)
          }
        } else {
          logger.stream.write(`No metadata found for: ${series.name}`)
          if (wss) {
            wss.broadcast(`No metadata found for: ${series.name}`)
          }
        }
      } catch (err) {
        logger.error(err)
        continue
      }
    }
  } catch (err) {
    reject(err)
  }
  resolve()
})

service.getSeriesById = async (id) => {
  try {
    const series = await Series.findOne({
      where: { id },
      include: [{ model: Metadata }, { model: Season, include: [Episode] }]
    })
    return series
  } catch (err) {
    throw err
  }
}

service.getSeriesByUuid = async (uuid) => {
  try {
    const series = await Series.findOne({
      where: { uuid },
      include: [{ model: Metadata }, { model: Season, include: [Episode] }]
    })
    return series
  } catch (err) {
    throw err
  }
}

service.getSeriesSeason = async (seriesId, season) => {
  try {
    const series = await Series.findOne({
      where: { id: seriesId },
      include: [Metadata]
    })
    if (series) {
      const seasonData = await Season.findOne({
        where: { seriesId: series.id, season },
        include: [Episode]
      })
      if (seasonData && !seasonData.local_poster_path) {
        if (series.Metadatum)
          seasonData.local_poster_path = series.Metadatum.local_poster_path
      }
      return seasonData
    } else {
      throw new Error(`Could not find series for uuid: ${uuid}`)
    }
  } catch (err) {
    throw err
  }
}

service.searchSeriesById = async (id, amount) => {
  try {
    const series = await Series.findByPk(id)
    const search = await searchTv(series.name.replace(/(\([0-9]{4}\))/g, ''))
    return search.results
  } catch (err) {
    throw err
  }
}

service.searchSeriesByTitle = async (title, amount) => {
  try {
    const search = await searchTv(title)
    return search.results
  } catch (err) {
    throw err
  }
}

/**
 * 
 * @param {*} seriesId The series Metadata we are updating
 * @param {*} tmdbId The new series to update to
 * @returns 
 */
service.changeSeriesMetadata = async (seriesId, tmdbId, create) => {
  try {

    const series = await Series.findOne({
      where: { id: seriesId },
      include: [Metadata]
    })

    if (!tmdbId) {
      tmdbId = series.Metadatum.tmdbId
    }

    const newMeta = await getTv(tmdbId)

    const backdropPath = newMeta.backdrop_path ? await downloadImage(newMeta.backdrop_path, 'original') : null
    const posterPath = newMeta.poster_path ? await downloadImage(newMeta.poster_path, 'w780') : null

    if (create) {
      const old = await Metadata.findOne({
        where: { seriesId }
      })
      if (old)
        old.destroy()
      await Metadata.create({
        seriesId: seriesId,
        tmdbId: newMeta.id,
        imdbId: newMeta.imdbId,
        tmdb_poster_path: newMeta.poster_path,
        tmdb_backdrop_path: newMeta.backdrop_path,
        local_poster_path: posterPath ? posterPath.split('/').pop() : null,
        local_backdrop_path: backdropPath ? backdropPath.split('/').pop() : null,
        release_date: newMeta.first_air_date,
        tmdb_rating: newMeta.vote_average,
        overview: newMeta.overview,
        genres: newMeta.genres.map((g) => g.name).join(','),
        name: newMeta.name,
      })
      const meta = await Metadata.findOne({
        where: { seriesId }
      })
      // async crawl happens in background
      crawlSeasons(seriesId, newMeta.seasons).catch(err => logger.error(err))
      return meta
    }
    const meta = await Metadata.findOne({
      where: { seriesId }
    })
    logger.info(`refreshing ${series.name} metadata`)
    meta.tmdbId = newMeta.id
    meta.imdbId = newMeta.imdbId
    meta.tmdb_poster_path = newMeta.poster_path
    meta.tmdb_backdrop_path = newMeta.backdrop_path
    meta.local_poster_path = posterPath ? posterPath.split('/').pop() : null
    meta.local_backdrop_path = backdropPath ? backdropPath.split('/').pop() : null
    meta.release_date = newMeta.first_air_date
    meta.tmdb_rating = newMeta.vote_average
    meta.overview = newMeta.overview
    meta.genres = newMeta.genres.map((g) => g.name).join(',')
    meta.name = newMeta.name
    meta.save()

    // async crawl happens in background
    crawlSeasons(seriesId, newMeta.seasons).catch(err => logger.error(err))
    return meta
  } catch (err) {
    logger.stream.write(err)
    throw err
  }
}

service.refreshSeasonEpisodesMetadata = async (id) => {
  try {
    const season = await Season.findOne({
      where: { id },
      include: [{ model: Series, include: [Metadata] }, Episode]
    })
    logger.info(`refreshing season ${season.season} episode metadata -- ${season.Series.name}`)
    if (season.Episodes) {
      if (!season.Series.Metadatum) throw new Error('Series has no Metadata')

      const meta = await getSeason(season.Series.Metadatum.tmdbId, season.season)
      if (meta) {
        for (const episode of season.Episodes) {
          const episodeMeta = meta.episodes.find((mep) => mep.episode_number === episode.episode_number)
          if (episodeMeta) {
            const stillPath = episodeMeta.still_path ? await downloadImage(episodeMeta.still_path, 'w300') : null
            episode.tmdbId = episodeMeta.id || null
            episode.name = episodeMeta.name || null
            episode.overview = episodeMeta.overview || null
            episode.tmdb_still_path = episodeMeta.still_path || null
            episode.local_still_path = stillPath ? stillPath.split('/').pop() : null
            episode.air_date = episodeMeta.air_date || null
            episode.season_number = episodeMeta.season_number
            episode.tmdb_rating = episodeMeta.vote_average || null
            episode.save()
          }
        }
      }
    } else {
      throw new Error('No TMDb id could be found')
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

service.probeSeasonEpisodes = async (id) => {
  try {
    const season = await Season.findOne({
      where: { id },
      include: [{ model: Series, include: [Metadata, Library] }, Episode]
    })
    const episodeFiles = getFiles(season.path)
    for (const file of episodeFiles) {
      const existsInDb = season.Episodes.find(ep => ep.filename === file)
      if (existsInDb) {
        logger.info(`probing file data -- ${file}`)
        try {
          const json = await probe(existsInDb.path)
          existsInDb.file_probe_data = json
          existsInDb.save()
        } catch (err) {
          logger.error(err)
        }
      }
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

service.syncSeries = async (id) => {
  try {
    const series = await Series.findOne({
      where: { id },
      include: [Episode, Season, Metadata, Library]
    })
    // check existing episodes and either update or destroy
    for (const episode of series.Episodes) {
      if (!existsSync(episode.path)) {
        logger.info(`sync series files -- untracking ${episode.filename}, could not locate on disk`)
        episode.destroy()
      } else {
        logger.info(`sync series files -- updating probe data ${episode.filename}`)
        try {
          const json = await probe(episode.path)
          episode.file_probe_data = json
          episode.save()
        } catch (err) {
          logger.error(err)
        }
      }
    }

    // check for new untracked files
    const seasonDirs = getDirectories(series.path)
    for (const seasonDir of seasonDirs) {
      const season = series.Seasons.find(s => s.path === `${series.path}/${seasonDir}`)
      const seasonNumber = getSeasonNumberFromSeasonDir(seasonDir)
      if (season) {
        const untracked = []
        for (let epFile of getFiles(season.path)) {
          const episode = series.Episodes.find(ep => ep.path === `${season.path}/${epFile}`)
          if (!episode) {
            untracked.push(epFile)
          }
        }
        logger.info(`sync series files -- found ${untracked.length} untracked files for Season ${season.season}...`)
        if (untracked.length > 0) {
          const tmdbSeason = series.Metadatum ? await getSeason(series.Metadatum.tmdbId, seasonNumber) : null
          for (const epFile of untracked) {
            await createEpisodeData(epFile, series, seasonDir, tmdbSeason)
          }
        }
      } else {
        logger.info(`sync series files -- found untracked season and attempting to add...`)
        const files = getFiles(`${series.path}/${seasonDir}`)
        if (files.length > 0) {
          const tmdbSeason = series.Metadatum || null
          await findOrCreateSeason(series.id, series.path, seasonDir, tmdbSeason)
          for (let epFile of files) {
            logger.info(`sync series files -- adding episode ${epFile}...`)
            await createEpisodeData(epFile, series, seasonDir, tmdbSeasosn)
          }
        }
      }
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

async function createSeriesMetadata(series) {
  const search = await searchTv(series.name)
  await sleep(500)
  if (search.results.length > 0) {
    const details = await getTv(search.results[0].id)
    if (details) {
      seasonData = details.seasons
      // logger.stream.write('download image')
      const backdropPath = details.backdrop_path ? await downloadImage(details.backdrop_path, 'original') : null
      const posterPath = details.poster_path ? await downloadImage(details.poster_path, 'w780') : null

      const seriesMeta = (await Metadata.findOrCreate({
        where: { seriesId: series.id },
        defaults: {
          seriesId: series.id,
          tmdbId: details.id,
          imdbId: details.imdbId ? details.imdbId : null,
          tmdb_poster_path: details.poster_path,
          tmdb_backdrop_path: details.backdrop_path,
          local_poster_path: posterPath ? posterPath.split('/').pop() : null,
          local_backdrop_path: backdropPath ? backdropPath.split('/').pop() : null,
          release_date: details.first_air_date,
          tmdb_rating: details.vote_average,
          overview: details.overview,
          genres: details.genres.map((g) => g.name).join(','),
          name: details.name
        }
      }))[0]
      return seriesMeta
    }
  }
  return null
}

service.addSeriesMetadata = (series) => createSeriesMetadata(series)

async function createSeries(name, path, libraryId) {
  const series = await Series.findOrCreate({
    where: {
      name,
      path,
      libraryId,
    },
    defaults: {
      name,
      path,
      libraryId,
      uuid: short.generate(),
    }
  })
  return series[0]

}

service.addSeries = (name, path, libraryId) => createSeries(name, path, libraryId)

service.getEpisodeCount = async (id) => {
  try {
    let seriesIds = await Series.findAll({
      attributes: ['id'],
      where: { libraryId: id },
      raw: true
    })
    seriesIds = seriesIds.map(ele => ele.id)
    const count = await Episode.count({
      where: {
        seriesId: {
          [Op.in]: seriesIds
        }
      }
    })
    return count
  } catch (err) {
    throw err
  }
}

service.getSeasonCount = async (id) => {
  try {
    let seriesIds = await Series.findAll({
      attributes: ['id'],
      where: { libraryId: id },
      raw: true
    })
    seriesIds = seriesIds.map(ele => ele.id)
    const count = await Season.count({
      where: {
        seriesId: {
          [Op.in]: seriesIds
        }
      }
    })
    return count
  } catch (err) {
    throw err
  }
}

service.getSeriesCount = async (id) => {
  try {
    const count = await Series.count({
      where: { libraryId: id }
    })
    return count
  } catch (err) {
    throw err
  }
}

service.crawlSeries = (libraryId, wss) => new Promise(async (resolve, reject) => {
  const library = await Library.findByPk(libraryId)
  wss.broadcast(`crawling initiated: ${library.name}`)
  try {
    if (!library) throw new Error(`Library does not exist with id: ${libraryId}`)
    library.crawling = true
    library.save()

    const seriesRootDirs = getDirectories(library.path)
    for (let seriesDir of seriesRootDirs) {
      logger.stream.write(`working: ${seriesDir}`)
      wss.broadcast(`working -- ${seriesDir}`)
      let series = await Series.findOne({
        where: { name: seriesDir, libraryId },
        include: [Metadata, Season]
      })
      if (!series) {
        logger.info(`creating series -- ${seriesDir}`)
        wss.broadcast(`creating series -- ${seriesDir}`)
        series = await createSeries(seriesDir, `${library.path}/${seriesDir}`, library.id)
      }
      if (!series.Metadatum) {
        logger.info(`creating metadata -- ${series.name}`)
        wss.broadcast(`creating metadata -- ${series.name}`)
        await createSeriesMetadata(series)
      }
      if (!series.Seasons) {
        logger.info(`crawling series seasons -- ${series.name}`)
        wss.broadcast(`crawling series seasons -- ${series.name}`)
        await crawlSeasons(series.id, null, wss)
      }
    }
    wss.broadcast(`crawling done: ${library.name}`)
    library.crawling = false
    library.save()
    return resolve()
  } catch (err) {
    library.crawling = false
    library.save()
    return reject(err)
  }
}).catch(err => logger.error(err))

module.exports = service