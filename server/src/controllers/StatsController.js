
/* eslint-disable no-restricted-globals */
const { getLibraryStats, getMediaYears, getLibrarySizes } = require('../services')

const controller = {}

controller.getLibraryStats = async (req, res, next) => {
  try {    
    const results = await getLibraryStats(req.params.id)
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

controller.getLibrarySizes = async (req, res, next) => {
  try {
    const results = await getLibrarySizes()
    return res.status(200).send(results)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller