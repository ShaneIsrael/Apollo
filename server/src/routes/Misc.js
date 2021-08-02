const { serveImage } = require('../controllers')

module.exports = (app) => {
  app.get('/api/v1/image/:id', serveImage)
}