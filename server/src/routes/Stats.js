const {
  getLibraryStats,
  getMediaYears,
  getLibrarySizes
} = require('../controllers/StatsController')
const { verifyAdmin, verifyStandard } = require('../middleware/auth')

module.exports = (app) => {
  app.get('/api/v1/stats/media/years', verifyStandard, getMediaYears)
  app.get('/api/v1/stats/library/sizes', verifyStandard, getLibrarySizes)
  app.get('/api/v1/stats/library/:id', verifyStandard, getLibraryStats)
}