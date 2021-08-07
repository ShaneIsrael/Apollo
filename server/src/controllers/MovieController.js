
/* eslint-disable no-restricted-globals */
const { getMovieByUuid, changeMovieMetadata, searchMovieById, searchMovieByTitle } = require('../services')

const controller = {}

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
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.searchMovieByTitle = async (req, res, next) => {
  try {
    const result = await searchMovieByTitle(req.params.title, 20)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.changeMovieMetadata = async (req, res, next) => {
  try {
    const { movieId, tmdbId, create } = req.body
    const result = await changeMovieMetadata(movieId, tmdbId, create)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller