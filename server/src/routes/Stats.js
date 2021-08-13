const {
  getLibraryStats,
  getMediaYears,
} = require('../controllers')
const { verifyAdmin, verifyStandard } = require('../middleware/auth')

module.exports = (app) => {
  app.get('/api/v1/stats/library/:id', verifyStandard, getLibraryStats)
  app.get('/api/v1/stats/media/years', verifyStandard, getMediaYears)
}