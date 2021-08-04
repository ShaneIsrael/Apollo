
/* eslint-disable no-restricted-globals */
const { getMovieByUuid } = require('../services')

const controller = {}

controller.getMovieByUuid = async (req, res, next) => {
  try {
    const result = await getMovieByUuid(req.query.uuid)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller