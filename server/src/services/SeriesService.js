const ENVIRONMENT = process.env.NODE_ENV || 'production'
const { readdirSync, writeFileSync, readFileSync } = require('fs')
const path = require('path')
const ffprobe = require('ffprobe')
const ffprobeStatic = ENVIRONMENT === 'production' ? require('../utils/ffprobe-static') : require('ffprobe-static')
const short = require('short-uuid')

const { searchTv, getTv, getSeason, downloadImage } = require('./TmdbService')
const { Library, Series, Metadata, Season, Episode } = require('../database/models')
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

async function findOrCreateSeason(seriesId, season, tmdbSeason) {
  let localPath
  if (tmdbSeason) {
    localPath = await downloadImage(tmdbSeason.poster_path, 'w342')
  }
  return (await Season.findOrCreate({
    where: {
      seriesId,
      season,
    },
    default: {
      seriesId,
      season,
      tmdb_poster_path: tmdbSeason ? tmdbSeason.poster_path : null,
      local_poster_path: localPath ? localPath.split('/').pop() : null
    }
  }))[0]
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
        const tmdbSeasonMeta = await getSeason(series.Metadatum.tmdbId, seasonNumber)
        for (let episode of episodeFiles) {
          const { ext } = path.parse(episode)
          if (VALID_EXTENSIONS.indexOf(ext) === -1) continue // not a valid video file

          const filenameNoExtension = path.parse(episode).name
          const seasonEpisodeParse = filenameNoExtension.match(/[sS]([0-9]+|[0-9]+)[eE]([0-9]+|[0-9]+)/)
          if (seasonEpisodeParse) {
            const episodeNumber = Number(seasonEpisodeParse[2])
            const episodeTitleSplit = filenameNoExtension.toLowerCase().split(` - ${seasonEpisodeParse[0].toLowerCase()} - `)
            let episodeTitle = ''
            if (episodeTitleSplit.length === 2) {
              episodeTitle = episodeTitleSplit[1]
            }

            const tmdbSeasonData = seasonData ? seasonData.find((s) => s.season_number === seasonNumber) : null
            const tmdbEpisodeData = tmdbSeasonMeta.episodes.find((episode) => episode.episode_number === episodeNumber)
            const seasonRow = await findOrCreateSeason(series.id, seasonNumber, tmdbSeasonData)

            let episodeRow = await Episode.findOne({
              where: {
                seasonId: seasonRow.id,
                episode_number: episodeNumber
              }
            })
            if (!episodeRow) {
              const stillPath = tmdbEpisodeData ? tmdbEpisodeData.still_path ? await downloadImage(tmdbEpisodeData.still_path, 'w300') : null : null
              await Episode.create({
                seriesId: series.id,
                seasonId: seasonRow.id,
                tmdbId: tmdbEpisodeData ? tmdbEpisodeData.id : null,
                filename: episode,
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
            }

            // On main crawl, only probe non-existen. 
            // There will be a function later for refreshing probe data in case of file changes
            if (!episodeRow.file_probe_data) {
              logger.stream.write(`probing file data -- ${episode}`)
              if (wss) {
                wss.broadcast(`\tprobing file data -- ${episode}`)
              }
              const probeData = await probe(path.join(library.path, series.name, seasonDir, episode))
              episodeRow.file_probe_data = probeData
              episodeRow.save()
            }
          } else {
            logger.error(`\t\t\tUnable to parse episode: ${series.name} -- ${episode}`)
            if (wss) {
              wss.broadcast(`\t\t\tUnable to parse episode: ${series.name} -- ${episode}`)
            }
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

    // If no metadata on series lookup, create new metadata else update current
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

service.crawlSeries = (libraryId, wss) => new Promise(async (resolve, reject) => {
  const library = await Library.findByPk(libraryId)
  wss.broadcast(`crawling initiated: ${library.name}`)
  try {
    if (!library) throw new Error(`Library does not exist with id: ${libraryId}`)
    library.crawling = true
    library.save()

    const seriesRootDirs = getDirectories(library.path)
    for (let series of seriesRootDirs) {
      series = (await Series.findOrCreate({
        where: {
          name: series
        },
        defaults: {
          name: series,
          uuid: short.generate(),
          libraryId
        },
        raw: true
      }))

      logger.stream.write(`working: ${series[0].name}`)
      let seasonData
      let seriesMeta
      if (series[1]) { // if it was newly created
        wss.broadcast(`\tfetching metadata -- ${series[0].name}`)
        const search = await searchTv(series[0].name)
        await sleep(500)
        if (search.results.length > 0) {
          const details = await getTv(search.results[0].id)
          seasonData = details.seasons
          if (details) {
            // logger.stream.write('download image')
            const backdropPath = details.backdrop_path ? await downloadImage(details.backdrop_path, 'original') : null
            const posterPath = details.poster_path ? await downloadImage(details.poster_path, 'w780') : null

            seriesMeta = (await Metadata.findOrCreate({
              where: { seriesId: series[0].id },
              defaults: {
                seriesId: series[0].id,
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
          }
        }
        await crawlSeasons(series[0].id, seasonData, wss)
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