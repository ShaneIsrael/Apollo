
/* eslint-disable no-restricted-globals */
const { getSeriesById, searchSeriesById, searchSeriesByTitle, 
  getSeriesByUuid, changeSeriesMetadata, getSeriesSeason,
  refreshSeasonEpisodesMetadata, probeSeasonEpisodes, syncSeries,
  getEpisodeCount, getSeasonCount, getSeriesCount, getSeriesSize } = require('../services')

const {setCache} = require('../utils/cacheData')

const controller = {}

controller.getSeriesSize = async (req, res, next) => {
  try {
    const { id } = req.query
    const size = await getSeriesSize(id)
    setCache(req, size)
    return res.status(200).send(size)
  } catch (err) {
    return next(err)
  }
}

controller.getEpisodeCount = async (req, res, next) => {
  try {
    const { id } = req.query
    const count = await getEpisodeCount(id)
    setCache(req, count)
    return res.status(200).send(String(count))
  } catch (err) {
    return next(err)
  }
}

controller.getSeasonCount = async (req, res, next) => {
  try {
    const { id } = req.query
    const count = await getSeasonCount(id)
    setCache(req, count)
    return res.status(200).send(String(count))
  } catch (err) {
    return next(err)
  }
}

controller.getSeriesCount = async (req, res, next) => {
  try {
    const { id } = req.query
    const count = await getSeriesCount(id)
    setCache(req, count)
    return res.status(200).send(String(count))
  } catch (err) {
    return next(err)
  }
}

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
    setCache(req, result)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.searchSeriesById = async (req, res, next) => {
  try {
    const result = await searchSeriesById(req.params.id, req.params.amount)
    setCache(req, result)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.searchSeriesByTitle = async (req, res, next) => {
  try {
    const result = await searchSeriesByTitle(req.params.title, 20)
    setCache(req, result)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.changeSeriesMetadata = async (req, res, next) => {
  try {
    const { seriesId, tmdbId, create } = req.body
    const result = await changeSeriesMetadata(seriesId, tmdbId, create)
    req.app.get('cache').flush()
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.refreshSeasonEpisodesMetadata = async (req, res, next) => {
  try {
    const { id } = req.body
    const result = await refreshSeasonEpisodesMetadata(id)
    req.app.get('cache').flush()
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