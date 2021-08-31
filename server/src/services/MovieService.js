const ENVIRONMENT = process.env.NODE_ENV || 'production'
const { readdirSync, writeFileSync, readFileSync, existsSync } = require('fs')
const path = require('path')
const short = require('short-uuid')
const ffprobe = require('ffprobe')
const ffprobeStatic = ENVIRONMENT === 'production' ? require('../utils/ffprobe-static') : require('ffprobe-static')

const { VALID_EXTENSIONS } = require('../constants')
const { searchMovie, getMovie, downloadImage } = require('./TmdbService')
const { Library, Movie, Metadata, MovieFile } = require('../database/models')
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

service.getMovieById = async (id) => {
  try {
    const movie = await Movie.findOne({
      where: { id },
      include: [Metadata]
    })
    return movie
  } catch (err) {
    throw err
  }
}

service.getMovieByUuid = async (uuid) => {
  try {
    const movie = await Movie.findOne({
      where: { uuid },
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
    if (!tmdbId) {
      const movie = await Movie.findOne({
        where: { id: movieId },
        include: [Meatadata]
      })
      tmdbId = movie.Metadatum.tmdbId
    }
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

service.syncMovie = async (id) => {
  try {
    const movie = await Movie.findOne({
      where: { id },
      include: [MovieFile, Metadata, Library]
    })
    // check existing episodes and either update or destroy
    for (const file of movie.MovieFiles) {
      if (!existsSync(file.path)) {
        logger.info(`sync movie files -- untracking ${file.filename}, could not locate on disk`)
        file.destroy()
      } else {
        logger.info(`sync movie files -- updating probe data ${file.filename}`)
        try {
          const json = await probe(file.path)
          file.metadata = json
          file.save()
        } catch (err) {
          logger.error(err)
        }
      }
    }

    // check for new untracked files
    const untracked = []
    for (let file of getFiles(movie.path)) {
      const movieFile = movie.MovieFiles.find(mf => mf.path === `${movie.path}/${file}`)
      if (!movieFile) {
        untracked.push(file)
      }
    }
    logger.info(`sync movie files -- found ${untracked.length} untracked files for Movie ${movie.name}...`)
    if (untracked.length > 0) {
      for (const file of untracked) {
        const { ext } = path.parse(file)
        if (VALID_EXTENSIONS.indexOf(ext) === -1) continue

        logger.info(`sync movie files -- creating MovieFile row for ${file}`)
        try {
          const filedata = await probe(path.join(movie.path, file))
          await MovieFile.create({
            movieId: movie.id,
            filename: file,
            path: `${movie.path}/${file}`,
            metadata: filedata
          })
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

async function createMovieMetadata(movie) {
  const search = await searchMovie(movie.name.replace(/(\([0-9]{4}\))/g, '')) // remove trailing (1000) year
  await sleep(500)
  if (search.results.length > 0) {
    const details = await getMovie(search.results[0].id)
    if (details) {
      const backdropPath = details.backdrop_path ? await downloadImage(details.backdrop_path, 'original') : null
      const posterPath = details.poster_path ? await downloadImage(details.poster_path, 'w780') : null
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
          release_date: details.release_date,
          tmdb_rating: details.vote_average,
          overview: details.overview,
          genres: details.genres.map((g) => g.name).join(','),
          name: details.title
        }
      }))[0]
      return meta
    }
  }
  return null
}

service.addMovieMetadata = (movie) => createMovieMetadata(movie)

async function createMovie(name, path, libraryId) {
  const movie = (await Movie.findOrCreate({
    where: {
      name,
      libraryId,
    },
    defaults: {
      name,
      path,
      uuid: short.generate(),
      libraryId
    },
  }))
  return movie[0]
}

service.addMovie = (name, path, libraryId) => createMovie(name, path, libraryId)

async function crawlMovieFiles(movie, wss) {
  const files = getFiles(movie.path)
  for (const file of files) {
    const { ext } = path.parse(file)
    if (VALID_EXTENSIONS.indexOf(ext) === -1) continue
    const fileRow = (await MovieFile.findOrCreate({
      where: {
        movieId: movie.id,
        filename: file
      },
      defaults: {
        movieId: movie.id,
        filename: file,
        path: `${movie.path}/${file}`
      }
    }))
    if (fileRow[1]) { // newly created
      wss && wss.broadcast(`probing movie file data -- ${file}`)
      try {
        const filedata = await probe(fileRow[0].path)
        fileRow[0].metadata = filedata
        fileRow[0].save()
      } catch (err) {
        logger.error(err)
      }
    }
  }
}

service.crawlMovieFiles = (movie) => crawlMovieFiles(movie)

service.crawlMovies = (libraryId, wss) => new Promise(async (resolve, reject) => {
  const library = await Library.findByPk(libraryId)
  wss.broadcast(`crawling initiated: ${library.name}`)
  try {
    if (!library) throw new Error(`Library does not exist with id: ${libraryId}`)
    library.crawling = true
    library.save()

    const moviesRootDirs = getDirectories(library.path)
    for (let movieDir of moviesRootDirs) {
      logger.stream.write(`working: ${movieDir}`)
      wss.broadcast(`working -- ${movieDir}`)
      let movie = await Movie.findOne({
        where: { name: movieDir, libraryId },
        include: [Metadata, MovieFile]
      })
      if (!movie) { // if it was newly created
        logger.info(`creating movie -- ${movieDir}`)
        wss.broadcast(`creating movie -- ${movieDir}`)
        movie = await createMovie(movieDir, `${library.path}/${movieDir}`, library.id)
      }
      if (!movie.Metadatum) {
        logger.info(`creating metadata -- ${movie.name}`)
        wss.broadcast(`creating metadata -- ${movie.name}`)
        await createMovieMetadata(movie)
      }
      if (!movie.MovieFile) {
        logger.info(`crawling movie files -- ${movie.name}`)
        wss.broadcast(`crawling movie files -- ${movie.name}`)
        await crawlMovieFiles(movie, wss)
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