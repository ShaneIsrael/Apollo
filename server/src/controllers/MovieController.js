
/* eslint-disable no-restricted-globals */
const { getMovieById, getMovieByUuid, changeMovieMetadata, searchMovieById, searchMovieByTitle, syncMovie, getMovieCount } = require('../services')

const controller = {}

const {setCache} = require('../utils/cacheData')

controller.getMovieCount = async (req, res, next) => {
  try {
    const { id } = req.query
    const count = await getMovieCount(id)
    setCache(req, count)
    return res.status(200).send(String(count))
  } catch (err) {
    return next(err)
  }
}

controller.getMovieById = async (req, res, next) => {
  try {
    const result = await getMovieById(req.query.id)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.getMovieByUuid = async (req, res, next) => {
  try {
    const result = await getMovieByUuid(req.query.uuid)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.searchMovieById = async (req, res, next) => {
  try {
    const result = await searchMovieById(req.params.id, req.params.amount)
    setCache(req, result)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.searchMovieByTitle = async (req, res, next) => {
  try {
    const result = await searchMovieByTitle(req.params.title, 20)
    setCache(req, result)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.changeMovieMetadata = async (req, res, next) => {
  try {
    const { movieId, tmdbId, create } = req.body
    const result = await changeMovieMetadata(movieId, tmdbId, create)
    req.app.get('cache').flush()
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.syncMovie = async (req, res, next) => {
  try {
    const { id } = req.body
    const result = await syncMovie(id)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller