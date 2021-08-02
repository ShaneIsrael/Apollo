const path = require('path')
const controllers = {}

controllers.serveImage = (req, res, next) => {
  // table uuid, uuid, filetype
  res.set('Cache-control', 'public, max-age=1440')
  res.sendFile(path.resolve(__dirname, '../../images/', `${req.params.id}`))
}

module.exports = controllers