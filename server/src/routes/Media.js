const {
  getMedia,
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/media/', getMedia)
}