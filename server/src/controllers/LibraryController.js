
/* eslint-disable no-restricted-globals */
const { existsSync, lstatSync } = require('fs')
const { getLibraries, getLibrary, createLibrary, updateLibrary, 
  deleteLibrary, getAllLibrarySeries, getAllLibraryMovies,
  crawlMovies, 
  crawlSeries} = require('../services')

const controller = {}

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
    const result = await getLibrary(res.query.id)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.createLibrary = async (req, res, next) => {
  try {
    const valid = await validatePath(req.body.path)

    if (!valid) return res.status(400).send('Invalid Library Path')
    const { name, path, type, description, misc } = req.body
    if (!name || !path || !type) {
      return res.status(400).send('Missing required fields [name, path, type]')
    }

    const result = await createLibrary(name, path, type, description, misc)
    if (type === 'movie')
      crawlMovies(result.id)
    if (type === 'series')
      crawlSeries(result.id)

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
    const result = await updateLibrary(req.body.id, req.body)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.deleteLibrary = async (req, res, next) => {
  try {
    await deleteLibrary(req.body.id)
    return res.status(200).send()
  } catch (err) {
    return next(err)
  }
}

controller.getAllLibrarySeries = async (req, res, next) => {
  try {
    const library = await getAllLibrarySeries(req.query.id)
    const media = []
    for(const series of library.Series) {
      if (!series.Metadatum) {
        continue
      }
      media.push({
        id: `${library.tag}-${series.id}`,
        title: series.Metadatum ? series.Metadatum.name || series.name : '',
        poster: series.Metadatum ? series.Metadatum.local_poster_path : '',
        seasons: 01,
        episodes: 23,
        runtime: 1000,
        width: 1920
      })
    }
    return res.status(200).send(media)
  } catch (err) {
    return next(err)
  }
}

controller.getAllLibraryMovies = async (req, res, next) => {
  try {
    const library = await getAllLibraryMovies(req.query.id)
    const media = []
    
    for(const movie of library.Movies) {
      if (!movie.Metadatum) {
        continue
      }
      media.push({
        id: `${library.tag}-${movie.id}`,
        title: movie.Metadatum ? movie.Metadatum.name || movie.name : '',
        poster: movie.Metadatum ? movie.Metadatum.local_poster_path : '',
        runtime: 1000,
        width: 1920
      })
    }
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

module.exports = controller