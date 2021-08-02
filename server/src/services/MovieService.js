const { readdirSync, writeFileSync, readFileSync } = require('fs')
const path = require('path')
const { searchMovie, getMovie, downloadImage } = require('./TmdbService')
const { Library, Movie, Metadata } = require('../database/models')

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

service.crawlMovies = (libraryId) => new Promise(async (resolve, reject) => {
  try {
    const library = await Library.findByPk(libraryId)
    if (!library) throw new Error(`Library does not exist with id: ${libraryId}`)

    const moviesRootDirs = getDirectories(library.path)
    for (let movie of moviesRootDirs) {
      movie = (await Movie.findOrCreate({
        where: {
          name: movie
        },
        defaults: {
          name: movie,
          libraryId
        },
        raw: true
      }))[0]
      console.log(`working: ${movie.name}`)
      const search = await searchMovie(movie.name.replace(/(\([0-9]{4}\))/g, '')) // remove trailing (1000) year
      await sleep(500)
      if (search.results.length > 0) {
        const details = await getMovie(search.results[0].id)
        if (details) {
          // console.log('download image')
          const backdropPath = details.backdrop_path ? await downloadImage(details.backdrop_path) : null
          const posterPath = details.poster_path ? await downloadImage(details.poster_path) : null
          const meta = (await Metadata.findOrCreate({
            where: { movieId: movie.id },
            defaults: {
              movieId: movie.id,
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