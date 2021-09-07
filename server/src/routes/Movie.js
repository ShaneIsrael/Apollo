const {
  getMovieById,
  getMovieByUuid,
  changeMovieMetadata,
  searchMovieById,
  searchMovieByTitle,
  syncMovie,
  getMovieCount,
  getMovieSize
} = require('../controllers')
const { verifyAdmin, verifyStandard } = require('../middleware/auth')
const { checkCache } = require('../middleware/cache')

module.exports = (app) => {
  app.get('/api/v1/movie', verifyStandard, getMovieById),
  app.get('/api/v1/movie/count', verifyStandard, checkCache, getMovieCount)
  app.get('/api/v1/movie/uuid', verifyStandard, getMovieByUuid),
  app.get('/api/v1/movie/search/:id/:amount', verifyStandard, checkCache, searchMovieById)
  app.get('/api/v1/movie/search/:title', verifyStandard, checkCache, searchMovieByTitle)
  app.get('/api/v1/movie/stats/size', verifyStandard, getMovieSize)
  app.put('/api/v1/movie/metadata', verifyAdmin, changeMovieMetadata)
  app.put('/api/v1/movie/sync', verifyAdmin, syncMovie)
}