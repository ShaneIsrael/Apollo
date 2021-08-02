
/* eslint-disable no-restricted-globals */
const { getMedia } = require('../services')

const controller = {}

controller.getMedia = async (req, res, next) => {
  try {
    const result = await getMedia(req.query.library, res.locals.db)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller