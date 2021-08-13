const {
  getConfig,
  saveConfig,
} = require('../controllers')
const { verifyAdmin } = require('../middleware/auth')

module.exports = (app) => {
  app.get('/api/v1/config', getConfig)
  app.post('/api/v1/config', verifyAdmin, saveConfig)
}