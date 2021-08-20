const {
  getSeriesById,
  getSeriesByUuid,
  getSeriesSeason,
  searchSeriesById,
  searchSeriesByTitle,
  changeSeriesMetadata,
} = require('../controllers')
const { verifyAdmin, verifyStandard } = require('../middleware/auth')

module.exports = (app) => {
  app.get('/api/v1/series', verifyStandard, getSeriesById)
  app.get('/api/v1/series/uuid', verifyStandard, getSeriesByUuid)
  app.get('/api/v1/series/:seriesId/season/:season', verifyStandard, getSeriesSeason)
  app.get('/api/v1/series/search/:id/:amount', verifyStandard, searchSeriesById)
  app.get('/api/v1/series/search/:title', verifyStandard, searchSeriesByTitle)
  app.put('/api/v1/series/metadata', verifyAdmin, changeSeriesMetadata)
}