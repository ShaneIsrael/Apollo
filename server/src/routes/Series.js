const {
  getSeriesByUuid,
  searchSeriesById,
  searchSeriesByTitle,
  changeSeriesMetadata,
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/series/uuid', getSeriesByUuid),
  app.get('/api/v1/series/search/:id/:amount', searchSeriesById)
  app.get('/api/v1/series/search/:title', searchSeriesByTitle)
  app.put('/api/v1/series/metadata', changeSeriesMetadata)
}