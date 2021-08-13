const {
  getMedia,
} = require('../controllers')
const { verifyAdmin, verifyStandard } = require('../middleware/auth')

module.exports = (app) => {
  app.get('/api/v1/media/', verifyStandard, getMedia)
}