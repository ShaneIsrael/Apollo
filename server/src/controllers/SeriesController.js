
/* eslint-disable no-restricted-globals */
const { searchSeriesById, getSeriesByUuid, changeSeriesMetadata } = require('../services')

const controller = {}

controller.getSeriesByUuid = async (req, res, next) => {
  try {
    const result = await getSeriesByUuid(req.query.uuid)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.searchSeriesById = async (req, res, next) => {
  try {
    const result = await searchSeriesById(req.params.id, req.params.amount)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.changeSeriesMetadata = async (req, res, next) => {
  try {
    const result = await changeSeriesMetadata(req.body.seriesId, req.body.tmdbId)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller