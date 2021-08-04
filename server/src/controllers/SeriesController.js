
/* eslint-disable no-restricted-globals */
const { getSeriesByUuid } = require('../services')

const controller = {}

controller.getSeriesByUuid = async (req, res, next) => {
  try {
    const result = await getSeriesByUuid(req.query.uuid)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller