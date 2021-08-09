const { readdirSync, writeFileSync, readFileSync } = require('fs')
const path = require('path')
const ffprobe = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')
const short = require('short-uuid')

const { searchTv, getTv, downloadImage } = require('./TmdbService')
const { Library, Series, Metadata, Season, EpisodeFile } = require('../database/models')
const { VALID_EXTENSIONS } = require('../constants')

const service = {}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function probe(path) {
  let info
  try {
    info = await ffprobe(path, { path: ffprobeStatic.path })
  } catch (err) {
    console.error(`\t${err.message}`)
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

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name).sort()

const getFiles = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => !dirent.isDirectory())
    .map(dirent => dirent.name)

service.getSeriesByUuid = async (uuid) => {
  try {
    const series = await Series.findOne({
      where: { uuid },
      include: [{ model: Metadata }, { model: Season, include: [EpisodeFile] }]
    })
    return series
  } catch (err) {
    throw err
  }
}

service.searchSeriesById = async (id, amount) => {
  try {
    const series = await Series.findByPk(id)
    const search = await searchTv(series.name)
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
    return meta
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

      console.log(`working: ${series[0].name}`)
      let seasonData
      if (series[1]) { // if it was newly created
        wss.broadcast(`\tfetching metadata -- ${series[0].name}`)
        const search = await searchTv(series[0].name)
        await sleep(500)
        if (search.results.length > 0) {
          const details = await getTv(search.results[0].id)
          seasonData = details.seasons
          if (details) {
            // console.log('download image')
            const backdropPath = details.backdrop_path ? await downloadImage(details.backdrop_path, 'original') : null
            const posterPath = details.poster_path ? await downloadImage(details.poster_path, 'w780') : null
            const meta = (await Metadata.findOrCreate({
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
      }
      const seasonDirs = getDirectories(path.resolve(library.path, series[0].name))
      for (let seasonDir of seasonDirs) {
        const episodeFiles = getFiles(path.resolve(library.path, series[0].name, seasonDir))
        for (let episode of episodeFiles) {
          const { ext } = path.parse(episode)
          if (VALID_EXTENSIONS.indexOf(ext) === -1) continue // not a valid video file

          const filenameNoExtension = path.parse(episode).name
          const seasonEpisodeParse = filenameNoExtension.match(/[sS]([0-9]+|[0-9]+)[eE]([0-9]+|[0-9]+)/)
          if (seasonEpisodeParse) {
            const seasonNumber = seasonEpisodeParse[1]
            const episodeNumber = Number(seasonEpisodeParse[2])
            const episodeTitleSplit = filenameNoExtension.toLowerCase().split(` - ${seasonEpisodeParse[0].toLowerCase()} - `)
            let episodeTitle = ''
            if (episodeTitleSplit.length === 2) {
              episodeTitle = episodeTitleSplit[1]
            }

            const tmdbSeason = seasonData ? seasonData.find((s) => s.season_number === Number(seasonNumber)) : null
            const seasonRow = await findOrCreateSeason(series[0].id, seasonNumber, tmdbSeason)
            const episodeRow = (await EpisodeFile.findOrCreate({
              where: {
                seasonId: seasonRow.id,
                filename: episode,
              },
              defaults: {
                seasonId: seasonRow.id,
                seriesId: series[0].id,
                filename: episode,
                episode: episodeNumber,
                title: episodeTitle,
              }
            }))
            if (episodeRow[1]) { // if it was created
              wss.broadcast(`\tprobing file data -- ${episode}`)
              const epmeta = await probe(path.join(library.path, series[0].name, seasonDir, episode))
              episodeRow[0].metadata = epmeta
              episodeRow[0].save()
            } else {
              continue
            }
          } else {
            console.error(`\t\t\tUnable to parse episode: ${series[0].name} -- ${episode}`)
            wss.broadcast(`\t\t\tUnable to parse episode: ${series[0].name} -- ${episode}`)
          }
        }
      }
    }
    wss.broadcast(`crawling done: ${library.name}`)
    library.crawling = false
    library.save()
    return resolve()
  } catch (err) {
    library.crawling = true
    library.save()
    return reject(err)
  }
}).catch(err => console.error(err))

module.exports = service