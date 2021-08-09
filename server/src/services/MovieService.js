const { readdirSync, writeFileSync, readFileSync } = require('fs')
const path = require('path')
const short = require('short-uuid')
const ffprobe = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')

const { VALID_EXTENSIONS } = require('../constants')
const { searchMovie, getMovie, downloadImage } = require('./TmdbService')
const { Library, Movie, Metadata, MovieFile } = require('../database/models')

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

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name).sort()

const getFiles = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => !dirent.isDirectory())
    .map(dirent => dirent.name)

service.getMovieByUuid = async (uuid) => {
  try {
    const movie = await Movie.findOne({
      where: {uuid},
      include: [Metadata]
    })
    return movie
  } catch (err) {
    throw err
  }
}

service.searchMovieById = async (id, amount) => {
  try {
    const movie = await Movie.findByPk(id)
    const search = await searchMovie(movie.name.replace(/(\([0-9]{4}\))/g, ''))
    return search.results
  } catch (err) {
    throw err
  }
}

service.searchMovieByTitle = async (title, amount) => {
  try {
    const search = await searchMovie(title)
    return search.results
  } catch (err) {
    throw err
  }
}

/**
 * 
 * @param {*} movieId The series Metadata we are updating
 * @param {*} tmdbId The new series to update to
 * @returns 
 */
 service.changeMovieMetadata = async (movieId, tmdbId, create) => {
  try {
    const newMeta = await getMovie(tmdbId)

    const backdropPath = newMeta.backdrop_path ? await downloadImage(newMeta.backdrop_path, 'original') : null
    const posterPath = newMeta.poster_path ? await downloadImage(newMeta.poster_path, 'w780') : null

    if (create) {
      const old = await Metadata.findOne({
        where: { movieId }
      })
      if (old)
        old.destroy()

      await Metadata.create({
        movieId,
        tmdbId: newMeta.id,
        imdbId: newMeta.imdbId,
        tmdb_poster_path: newMeta.poster_path,
        tmdb_backdrop_path: newMeta.backdrop_path,
        local_poster_path: posterPath ? posterPath.split('/').pop() : null,
        local_backdrop_path: backdropPath ? backdropPath.split('/').pop() : null,
        release_date: newMeta.release_date,
        tmdb_rating: newMeta.vote_average,
        overview: newMeta.overview,
        genres: newMeta.genres.map((g) => g.name).join(','),
        name: newMeta.title,
      })
      const meta = await Metadata.findOne({
        where: { movieId }
      })
      return meta
    }

    const meta = await Metadata.findOne({
      where: { movieId }
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
    meta.name = newMeta.title
    meta.save()
    return meta
  } catch (err) {
    throw err
  }
}

service.crawlMovies = (libraryId, wss) => new Promise(async (resolve, reject) => {
  const library = await Library.findByPk(libraryId)
  wss.broadcast(`crawling initiated: ${library.name}`)
  try {
    if (!library) throw new Error(`Library does not exist with id: ${libraryId}`)
    library.crawling = true
    library.save()
    
    const moviesRootDirs = getDirectories(library.path)
    for (let movieDir of moviesRootDirs) {
      movie = (await Movie.findOrCreate({
        where: {
          name: movieDir
        },
        defaults: {
          name: movieDir,
          uuid: short.generate(),
          libraryId
        },
        raw: true
      }))
      if (movie[1]) { // if it was newly created
        wss.broadcast(`\tfetching metadata -- ${movie[0].name}`)
        const search = await searchMovie(movie[0].name.replace(/(\([0-9]{4}\))/g, '')) // remove trailing (1000) year
        await sleep(500)
        if (search.results.length > 0) {
          const details = await getMovie(search.results[0].id)
          if (details) {
            // console.log('download image')
            const backdropPath = details.backdrop_path ? await downloadImage(details.backdrop_path, 'original') : null
            const posterPath = details.poster_path ? await downloadImage(details.poster_path, 'w780') : null
            const meta = (await Metadata.findOrCreate({
              where: { movieId: movie[0].id },
              defaults: {
                movieId: movie[0].id,
                tmdbId: details.id,
                imdbId: details.imdbId ? details.imdbId : null,
                tmdb_poster_path: details.poster_path,
                tmdb_backdrop_path: details.backdrop_path,
                local_poster_path: posterPath ? posterPath.split('/').pop() : null,
                local_backdrop_path: backdropPath ? backdropPath.split('/').pop() : null,
                release_date: details.release_date,
                tmdb_rating: details.vote_average,
                overview: details.overview,
                genres: details.genres.map((g) => g.name).join(','),
                name: details.title
              }
            }))[0]
          }
        }
      }
      const files = getFiles(path.resolve(library.path, movie[0].name))
      for (const file of files) {
        console.log(`\tchecking ${file}`)
        const { ext } = path.parse(file)
        if (VALID_EXTENSIONS.indexOf(ext) === -1) continue
        const fileRow = (await MovieFile.findOrCreate({
          where: {
            movieId: movie[0].id,
            filename: file
          },
          defaults: {
            movieId: movie[0].id,
            filename: file
          }
        }))
        if (fileRow[1]) {
          wss.broadcast(`\tprobing file data -- ${file}`)
          const filedata = await probe(path.join(library.path, movie[0].name, file))
          fileRow[0].metadata = filedata
          fileRow[0].save()
        } else {
          continue
        }
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
}).catch(err => console.error(err))

module.exports = service