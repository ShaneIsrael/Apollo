const chokidar = require('chokidar')
const fs = require('fs')
const path = require('path')
const logger = require('../logger')
const { getLibraries, addEpisode, addSeries, addSeriesMetadata, addMovie, crawlMovieFiles, addMovieMetadata } = require('../services')
const { Series, Movie, Metadata } = require('../database/models')
const { VALID_EXTENSIONS } = require('../constants')

const toGenericPath = (ffpath) => ffpath.split(path.sep).join(path.posix.sep)

class Observer {
  constructor() {
    this.watch()
    this.libraries
  }
  async watch() {
    try {
      if (this.watcher) {
        this.watcher.close().then(() => logger.info('Library observer closed'))
      }

      this.libraries = await getLibraries()
      if (this.libraries.length > 0) {
        this.watcher = chokidar.watch(this.libraries.map(library => library.path), { persistent: true, ignoreInitial: true })

        logger.info(`>> watching ${this.libraries.length} libraries <<`)

        this.watcher
          .on('addDir', ffpath => handleDirectoryAdded(toGenericPath(ffpath), this.findLibraryFromPath(toGenericPath(ffpath))))
          .on('unlinkDir', ffpath => handleDirectoryDeleted(toGenericPath(ffpath), this.findLibraryFromPath(toGenericPath(ffpath))))
          .on('add', ffpath => handleFileAdded(toGenericPath(ffpath), this.findLibraryFromPath(toGenericPath(ffpath))))
          .on('unlink', ffpath => handleFileDeleted(toGenericPath(ffpath), this.findLibraryFromPath(toGenericPath(ffpath))))
          .on('change', ffpath => handleChange(toGenericPath(ffpath), this.findLibraryFromPath(toGenericPath(ffpath))))
      }
    } catch (error) {
      logger.error(error)
    }
  }
  findLibraryFromPath(ffpath) {
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
            where: { libraryId: library.id, path: seriesPath},
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
    })
  }
}
async function handleFileDeleted(ffpath, library) {
  // logger.info(`file-deleted -> ${ffpath} | Library -> ${library.name}`)
  if (library) {
    getChangeLevel(ffpath, library).then(level => level && console.log(`detected a ${level} level change`))
  }
}
async function handleChange(ffpath, library) {
  // logger.info(`changed -> ${ffpath} | Library -> ${library.name}`)
  if (library) {
    getChangeLevel(ffpath, library).then(level => level && console.log(`detected a ${level} level change`))
  }
}

module.exports = Observer