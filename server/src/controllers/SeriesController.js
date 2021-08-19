
/* eslint-disable no-restricted-globals */
const { searchSeriesById, searchSeriesByTitle, getSeriesByUuid, changeSeriesMetadata, getSeriesSeason } = require('../services')

const controller = {}

controller.getSeriesByUuid = async (req, res, next) => {
  try {
    const result = await getSeriesByUuid(req.query.uuid)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.getSeriesSeason = async (req, res, next) => {
  try {
    const result = await getSeriesSeason(req.params.uuid, req.params.season)
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

controller.searchSeriesByTitle = async (req, res, next) => {
  try {
    const result = await searchSeriesByTitle(req.params.title, 20)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.changeSeriesMetadata = async (req, res, next) => {
  try {
    const { seriesId, tmdbId, create } = req.body
    const result = await changeSeriesMetadata(seriesId, tmdbId, create)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller