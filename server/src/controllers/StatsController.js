
/* eslint-disable no-restricted-globals */
const { getLibraryStats, getSeriesYears, getMovieYears, getMediaYears, getMedia } = require('../services')

const controller = {}

controller.getLibraryStats = async (req, res, next) => {
  try {    
    const results = await getLibraryStats(req.params.id)
    return res.status(200).send(results)
  } catch (err) {
    return next(err)
  }
}

controller.getSeriesYears = async (req, res, next) => {
  try {
    const results = await getSeriesYears()
    return res.status(200).send(results)
  } catch (err) {
    return next(err)
  }
}

controller.getMovieYears = async (req, res, next) => {
  try {
    const results = await getMovieYears()
    return res.status(200).send(results)
  } catch (err) {
    return next(err)
  }
}

controller.getMediaYears = async (req, res, next) => {
  try {
    const results = await getMediaYears()
    return res.status(200).send(results)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller