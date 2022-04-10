const {
  getSeriesById,
  getSeriesByUuid,
  getSeriesSeason,
  searchSeriesById,
  searchSeriesByTitle,
  changeSeriesMetadata,
  refreshSeasonEpisodesMetadata,
  probeSeasonEpisodes,
  syncSeries,
  getEpisodeCount,
  getSeasonCount,
  getSeriesCount,
  getSeriesSize,
} = require('../controllers/SeriesController')
const { verifyAdmin, verifyStandard } = require('../middleware/auth')
const { checkCache } = require('../middleware/cache')

module.exports = (app) => {
  app.get('/api/v1/series', verifyStandard, getSeriesById)
  app.get('/api/v1/series/uuid', verifyStandard, getSeriesByUuid)
  app.get('/api/v1/series/:seriesId/season/:season', verifyStandard, checkCache, getSeriesSeason)
  app.get('/api/v1/series/search/:id/:amount', verifyStandard, checkCache, searchSeriesById)
  app.get('/api/v1/series/search/:title', verifyStandard, checkCache, searchSeriesByTitle)
  app.get('/api/v1/series/count', verifyStandard, checkCache, getSeriesCount)
  app.get('/api/v1/series/episode/count', verifyStandard, checkCache, getEpisodeCount)
  app.get('/api/v1/series/season/count', verifyStandard, checkCache, getSeasonCount)
  app.get('/api/v1/series/stats/size', verifyStandard, getSeriesSize)
  app.put('/api/v1/series/metadata', verifyAdmin, changeSeriesMetadata)
  app.put('/api/v1/series/season/episodes/metadata', verifyAdmin, refreshSeasonEpisodesMetadata)
  app.put('/api/v1/series/season/probe', verifyAdmin, probeSeasonEpisodes)
  app.put('/api/v1/series/sync', verifyAdmin, syncSeries)
}