
/* eslint-disable no-restricted-globals */
const { existsSync, lstatSync } = require('fs')
const { getLibraries, getLibrary, getLibraryByTag, createLibrary, updateLibrary,
  deleteLibrary, getAllLibrarySeries, getAllLibraryMovies,
  crawlMovies, crawlSeries, isCrawlingActive } = require('../services')

const { Library } = require('../database/models')
const logger = require('../logger')

const { setCache, flushCache } = require('../utils/cacheData')

const controller = {}

function calculateDuration(duration) {
  if (duration) {
    let [hours, minutes, seconds] = duration.split(':')
    seconds = (Number(hours) * 60 * 60) + (Number(minutes) * 60) + Number(seconds)
    return seconds
  }
  return 0
}

function validatePath(path) {
  try {
    const valid = existsSync(path) && lstatSync(path).isDirectory()
    return valid
  } catch (err) {
    return next(err)
  }
}

controller.getLibraries = async (req, res, next) => {
  try {
    const result = await getLibraries()
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.getLibrary = async (req, res, next) => {
  try {
    const result = await getLibrary(req.query.id)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.getLibraryByTag = async (req, res, next) => {
  try {
    const result = await getLibraryByTag(req.query.tag)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.createLibrary = async (req, res, next) => {
  try {
    const valid = await validatePath(req.body.path)

    if (!valid) return res.status(400).send('Invalid Library Path')
    let { name, path, type, description, misc } = req.body
    name = name.trim()
    type = type.toLowerCase()
    if (!name || !path || !type) {
      return res.status(400).send('Missing required fields [name, path, type]')
    }
    if (name.match(/[^A-Za-z0-9\s]/g))
      return res.status(400).send('Only letters, numbers, and spaces are allowed.')
    if (['series', 'movie'].indexOf(type.toLowerCase()) === -1)
      return res.status(400).send('Library type must be either series or movie.')

    const result = await createLibrary(name.trim(), path, type, description, misc)
    const crawling = await isCrawlingActive()

    if (!crawling) {
      if (type === 'movie')
        crawlMovies(result.id, req.app.get('wss'))
      if (type === 'series')
        crawlSeries(result.id, req.app.get('wss'))
    }

    const observer = req.app.get('observer')
    observer.watch(path)
    flushCache(req)
    return res.status(200).send(result)
  } catch (err) {
    if (err.message === 'Validation error') {
      return res.status(400).send('Library already exists.')
    }
    return next(err)
  }
}

controller.updateLibrary = async (req, res, next) => {
  try {
    let { name, type, path, description, misc } = req.body
    name = name.trim()
    type = type.toLowerCase()
    if (!name || !path || !type) {
      return res.status(400).send('Missing required fields [name, path, type]')
    }
    if (name.match(/[^A-Za-z0-9\s]/g))
      return res.status(400).send('Only letters, numbers, and spaces are allowed.')
    if (['series', 'movie'].indexOf(type.toLowerCase()) === -1)
      return res.status(400).send('Library type must be either series or movie.')

      
      const result = await updateLibrary(req.body.id, req.body)
      new Promise((resolve) => {
        const observer = req.app.get('observer')
        observer.init()
        resolve()
      })
    flushCache(req)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.deleteLibrary = async (req, res, next) => {
  try {
    const library = await Library.findByPk(req.body.id)
    if (library.crawling) {
      return res.status(400).send('Cannot delete during an active crawl.')
    }
    await deleteLibrary(req.body.id)

    const observer = req.app.get('observer')
    observer.unwatch(library.path)
    flushCache(req)
    return res.status(200).send('ok')
  } catch (err) {
    return next(err)
  }
}

controller.getAllLibrarySeries = async (req, res, next) => {
  try {
    const library = await getAllLibrarySeries(req.query.id)
    const media = []

    for (const series of library.Series) {
      media.push({
        id: `${library.tag}-${series.id}`,
        seriesId: series.id,
        uuid: series.uuid,
        title: series.name,
        metaTitle: series.Metadatum ? series.Metadatum.name : null,
        poster: series.Metadatum ? series.Metadatum.local_poster_path : '',
      })
    }
    setCache(req, media)
    return res.status(200).send(media)
  } catch (err) {
    return next(err)
  }
}

controller.getAllLibraryMovies = async (req, res, next) => {
  try {
    const library = await getAllLibraryMovies(req.query.id)
    const media = []

    for (const movie of library.Movies) {
      media.push({
        id: `${library.tag}-${movie.id}`,
        movieId: movie.id,
        uuid: movie.uuid,
        title: movie.name,
        metaTitle: movie.Metadatum ? movie.Metadatum.name : null,
        poster: movie.Metadatum ? movie.Metadatum.local_poster_path : '',
      })
    }
    setCache(req, media)
    return res.status(200).send(media)
  } catch (err) {
    return next(err)
  }
}

controller.validateLibraryPath = async (req, res, next) => {
  try {
    const { path } = req.body
    const valid = validatePath(path)
    return res.status(200).send(valid)
  } catch (err) {
    return next(err)
  }
}

controller.crawl = async (req, res, next) => {
  try {

    const { id } = req.body
    const library = await getLibrary(id)
    const crawling = await isCrawlingActive()

    if (!crawling) {
      const wss = req.app.get('wss')
      if (library.type === 'movie')
        crawlMovies(library.id, wss)
      if (library.type === 'series')
        crawlSeries(library.id, wss)
    } else {
      return res.status(409).send('A library crawl is currently active')
    }
    return res.status(200).send('ok')
  } catch (err) {
    return next(err)
  }
}

controller.isLibraryCrawling = async (req, res, next) => {
  const { id } = req.query
  try {
    const library = await getLibrary(id)
    return res.status(200).send(library ? library.crawling : false)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller