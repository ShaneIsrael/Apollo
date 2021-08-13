const {
  getLibraryStats,
  getMediaYears,
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/stats/library/:id', getLibraryStats)
  app.get('/api/v1/stats/media/years', getMediaYears)
}