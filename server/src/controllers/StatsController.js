
/* eslint-disable no-restricted-globals */
const { getLibraryStats } = require('../services')

const controller = {}

controller.getLibraryStats = (req, res, next) => {
  getLibraryStats(req.params.id).then(results => {
    res.status(200).send(results)
  }).catch(err => next(err))
  // try {
  //   return res.status(200).send(result)
  // } catch (err) {
  //   return next(err)
  // }
}

module.exports = controller