
/* eslint-disable no-restricted-globals */
const { getLibraryStats } = require('../services')

const controller = {}

controller.getLibraryStats = async (req, res, next) => {
  try {
    const result = await getLibraryStats(req.params.id)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller