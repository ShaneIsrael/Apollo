
/* eslint-disable no-restricted-globals */
const { getMovieByUuid, changeMovieMetadata, searchMovieById } = require('../services')

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

controller.changeMovieMetadata = async (req, res, next) => {
  try {
    const result = await changeMovieMetadata(req.body.movieId, req.body.tmdbId)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller