
/* eslint-disable no-restricted-globals */
const { getSeriesById, searchSeriesById, searchSeriesByTitle, 
  getSeriesByUuid, changeSeriesMetadata, getSeriesSeason,
  refreshSeasonEpisodesMetadata, probeSeasonEpisodes, syncSeries} = require('../services')

const controller = {}

controller.getSeriesById = async (req, res, next) => {
  try {
    const result = await getSeriesById(req.query.id)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

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
    const result = await getSeriesSeason(req.params.seriesId, req.params.season)
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

controller.refreshSeasonEpisodesMetadata = async (req, res, next) => {
  try {
    const { id } = req.body
    const result = await refreshSeasonEpisodesMetadata(id)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.probeSeasonEpisodes = async (req, res, next) => {
  try {
    const { id } = req.body
    const result = await probeSeasonEpisodes(id)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.syncSeries = async (req, res, next) => {
  try {
    const { id } = req.body
    const result = await syncSeries(id)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller