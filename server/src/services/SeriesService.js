const { readdirSync, writeFileSync, readFileSync } = require('fs')
const path = require('path')
const { searchTv, getTv, downloadImage } = require('./TmdbService')
const { Library, Series, Metadata } = require('../database/models')

const service = {}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name).sort()

const getFiles = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => !dirent.isDirectory())
    .map(dirent => dirent.name)

service.crawlSeries = (libraryId) => new Promise(async (resolve, reject) => {
  try {
    const library = await Library.findByPk(libraryId)
    if (!library) throw new Error(`Library does not exist with id: ${libraryId}`)

    const seriesRootDirs = getDirectories(library.path)
    for (let series of seriesRootDirs) {
      series = (await Series.findOrCreate({
        where: {
          name: series
        },
        defaults: {
          name: series,
          libraryId
        },
        raw: true
      }))[0]
      console.log(`working: ${series.name}`)
      const search = await searchTv(series.name)
      await sleep(500)
      if (search.results.length > 0) {
        const details = await getTv(search.results[0].id)
        if (details) {
          // console.log('download image')
          const backdropPath = details.backdrop_path ? await downloadImage(details.backdrop_path) : null
          const posterPath = details.poster_path ? await downloadImage(details.poster_path) : null
          const meta = (await Metadata.findOrCreate({
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
        }
      }
    }
    return resolve()
  } catch (err) {
    return reject(err)
  }
}).catch(err => console.error(err))

module.exports = service