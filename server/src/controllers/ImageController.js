const path = require('path')
const { existsSync } = require('fs')
const config = require(path.join(__dirname, '../config/index.js'))[process.env.NODE_ENV || 'production']

const { Episode } = require('../database/models')

const controllers = {}

controllers.serveImage = (req, res, next) => {
  // table uuid, uuid, filetype
  if (req.params.id) {
    if (existsSync(path.join(config.appdata, config.imageDir, `${req.params.id}`))) {
      res.set('Cache-control', 'public, max-age=1440')
      return res.sendFile(path.join(config.appdata, config.imageDir, `${req.params.id}`))
    }
  }
  return res.status(404).send()
}

module.exports = controllers