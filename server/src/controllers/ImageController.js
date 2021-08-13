const path = require('path')
const config = require('../config')[process.env.NODE_ENV || 'dev']

const controllers = {}

controllers.serveImage = (req, res, next) => {
  // table uuid, uuid, filetype
  if (req.params.id) {
    res.set('Cache-control', 'public, max-age=1440')
    return res.sendFile(path.join(config.appdata, config.imageDir, `${req.params.id}`))
  }
  return res.status(404).send()
}

module.exports = controllers