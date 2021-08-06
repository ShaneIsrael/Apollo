const {
  getSeriesByUuid,
  searchSeriesById,
  changeSeriesMetadata,
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/series/uuid', getSeriesByUuid),
  app.get('/api/v1/series/search/:id/:amount', searchSeriesById)
  app.put('/api/v1/series/metadata', changeSeriesMetadata)
}