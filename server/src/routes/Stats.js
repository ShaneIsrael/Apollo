const {
  getLibraryStats,
  getSeriesYears,
  getMovieYears,
  getMediaYears,
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/stats/library/:id', getLibraryStats)
  app.get('/api/v1/stats/series/years', getSeriesYears)
  app.get('/api/v1/stats/movie/years', getMovieYears)
  app.get('/api/v1/stats/media/years', getMediaYears)
}