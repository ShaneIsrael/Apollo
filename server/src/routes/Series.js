const {
  getSeriesByUuid,
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/series/uuid', getSeriesByUuid)
}