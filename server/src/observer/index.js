const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')
const logger = require('../logger')
const { getLibraries } = require('../services/LibraryService')
const { addEpisode, addSeries, addSeriesMetadata } = require('../services/SeriesService')
const { addMovie, crawlMovieFiles, addMovieMetadata } = require('../services/MovieService')
const { Series, Movie, Metadata } = require('../database/models')
const { VALID_EXTENSIONS } = require('../constants')

const toGenericPath = (ffpath) => ffpath.split(path.sep).join(path.posix.sep)

class Observer {
  constructor() {
    this.init()
    this.watched = []
  }
  printWatched() {
    if (!this.watcher) return logger.error('The observer must be initialized first.')
    
    console.log('------ WATCHING LIBRARIES ------')

    for (const path of this.watched) {
      console.log('\x1b[32m', path, '\x1b[0m')
    }
    console.log('--------------------------------')
  }
  async init() {
    if (this.watcher) {
      await this.watcher.close()
      logger.info('Library observer closed')
    }
    getLibraries().then(libraries => {
      this.libraries = libraries
      if (this.libraries.length > 0) {
        this.watched = this.libraries.map(library => library.path)
        this.watcher = chokidar.watch(this.watched, {
          persistent: true,
          ignoreInitial: true
        })

        this.watcher
          .on('addDir', ffpath => handleDirectoryAdded(toGenericPath(ffpath), this.findLibraryFromPath(toGenericPath(ffpath))))
          .on('unlinkDir', ffpath => handleDirectoryDeleted(toGenericPath(ffpath), this.findLibraryFromPath(toGenericPath(ffpath))))
          .on('add', ffpath => handleFileAdded(toGenericPath(ffpath), this.findLibraryFromPath(toGenericPath(ffpath))))
          .on('unlink', ffpath => handleFileDeleted(toGenericPath(ffpath), this.findLibraryFromPath(toGenericPath(ffpath))))
          .on('change', ffpath => handleChange(toGenericPath(ffpath), this.findLibraryFromPath(toGenericPath(ffpath))))

        this.printWatched()
      }
    }).catch(error => logger.error(error))
  }
  async watch(path) {
    if (!path) return logger.error('A path must be specified.')
    if (!this.watcher) return logger.error('The observer must be initialized first.')

    this.watcher.add(toGenericPath(path))
    this.watched.push(toGenericPath(path))
    this.printWatched()
  }
  async unwatch(path) {
    if (!path) return logger.error('A path must be specified.')
    if (!this.watcher) return logger.error('The observer must be initialized first.')

    this.watcher.unwatch(toGenericPath(path))
    this.watched = this.watched.filter(p => toGenericPath(path) !== p)
    this.printWatched()
  }
  findLibraryFromPath(ffpath) {
    if (!this.libraries) return null
    return this.libraries.find(library => ffpath.indexOf(toGenericPath(library.path)) === 0)
  }
}


const getLastDir = (ffpath, level = 1) => {
  ffpath = toGenericPath(ffpath)
  if (ffpath) {
    const split = ffpath.split('/')
    for (let i = 0; i < level; i++) {
      split.pop()
    }
    return split.join('/')
  }
  return ''
}

async function getSeriesChangeLevel(ffpath, library) {
  const libraryPath = toGenericPath(library.path)
  const lastDir = getLastDir(ffpath)

  if (!fs.existsSync(ffpath)) return null

  try {
    if (fs.lstatSync(ffpath).isDirectory()) {
      // series or season added
      // check if series level change
      if (libraryPath === lastDir) {
        return "series"
      }
      // check if season level change
      const series = await Series.findOne({
        where: {
          libraryId: library.id,
          path: lastDir
        }
      })
      if (series) {
        return "series-season"
      }
    } else if (fs.lstatSync(ffpath).isFile(ffpath)) {
      const { ext } = path.parse(ffpath)
      if (VALID_EXTENSIONS.indexOf(ext) === -1) return null
      // episode or other added
      // episodes must belong to a season and seasons to series
      // check that the file is exactly 2 levels down from series
      return "series-episode"
    }
  } catch (err) {
    logger.error(err)
  }
  return null
}

async function getMovieChangeLevel(ffpath, library) {
  const libraryPath = toGenericPath(library.path)
  const lastDir = getLastDir(ffpath)

  if (!fs.existsSync(ffpath)) return null

  try {
    if (fs.lstatSync(ffpath).isDirectory()) {
      // movie folder
      // check if movie level change
      if (libraryPath === lastDir) {
        return "movie-folder"
      }
    } else {
      const { ext } = path.parse(ffpath)
      if (VALID_EXTENSIONS.indexOf(ext) === -1) return null
      // check if movie file level change
      return "movie-file"
    }
  } catch (err) {
    logger.error(err)
  }
  return null
}

function getChangeLevel(ffpath, library) {
  const changeLevel = library.type === 'series' ? getSeriesChangeLevel(ffpath, library) : getMovieChangeLevel(ffpath, library)
  return changeLevel
}

async function handleDirectoryAdded(ffpath, library) {
  // logger.info(`dir-added -> ${ffpath} | Library -> ${library.name}`)
  if (library) {
    getChangeLevel(ffpath, library).then(level => level && console.log(`detected a ${level} level change`))
  }
}
async function handleDirectoryDeleted(ffpath, library) {
  // logger.info(`dir-deleted -> ${ffpath} | Library -> ${library.name}`)
  if (library) {
    getChangeLevel(ffpath, library).then(level => level && console.log(`detected a ${level} level change`))
  }
}
async function handleFileAdded(ffpath, library) {
  // logger.info(`file-added -> ${ffpath} | Library -> ${library.name}`)
  if (library) {
    getChangeLevel(ffpath, library).then(async (level) => {
      if (level) {
        logger.info(`observer -> detected ${level} change at path: ${ffpath}`)
        if (level === 'series-episode') {
          const seriesPath = getLastDir(ffpath, 2)
          let series = await Series.findOne({
            where: {
              libraryId: library.id,
              path: seriesPath
            },
            include: [Metadata]
          })
          if (!series) {
            // create the series
            const seriesName = seriesPath.split('/').pop()
            logger.info(`observer -> creating series: ${seriesName}`)
            series = await addSeries(seriesName, seriesPath, library.id)
            await addSeriesMetadata(series)
            series = await Series.findOne({
              where: { libraryId: library.id, path: seriesPath },
              include: [Metadata]
            })
          }
          logger.info(`observer -> adding episode: ${toGenericPath(ffpath).split('/').pop()}`)
          const filename = toGenericPath(ffpath).split('/').pop()
          const seasonDirectoryName = getLastDir(ffpath).split('/').pop()
          addEpisode(filename, series, seasonDirectoryName)
        }
        if (level === 'movie-file') {
          const moviePath = getLastDir(ffpath)
          let movie = await Movie.findOne({
            where: {
              libraryId: library.id,
              path: moviePath
            },
            include: [Metadata]
          })
          if (!movie) {
            // create the movie
            const movieName = moviePath.split('/').pop()
            logger.info(`observer -> adding movie: ${movieName}`)
            movie = await addMovie(moviePath.split('/').pop(), moviePath, library.id)
            await crawlMovieFiles(movie)
            await addMovieMetadata(movie)
          }
        }
      }
    })
  }
}
async function handleFileDeleted(ffpath, library) {
  // logger.info(`file-deleted -> ${ffpath} | Library -> ${library.name}`)
  if (library) {
    getChangeLevel(ffpath, library).then(level => level && console.log(`detected a ${level} level file delete change`))
  }
}
async function handleChange(ffpath, library) {
  // logger.info(`changed -> ${ffpath} | Library -> ${library.name}`)
  if (library) {
    getChangeLevel(ffpath, library).then(level => level && console.log(`detected a ${level} level change`))
  }
}

module.exports = Observer