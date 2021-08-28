const {
  getMovieById,
  getMovieByUuid,
  changeMovieMetadata,
  searchMovieById,
  searchMovieByTitle,
  syncMovie,
} = require('../controllers')
const { verifyAdmin, verifyStandard } = require('../middleware/auth')

module.exports = (app) => {
  app.get('/api/v1/movie', verifyStandard, getMovieById),
  app.get('/api/v1/movie/uuid', verifyStandard, getMovieByUuid),
  app.get('/api/v1/movie/search/:id/:amount', verifyStandard, searchMovieById)
  app.get('/api/v1/movie/search/:title', verifyStandard, searchMovieByTitle)
  app.put('/api/v1/movie/metadata', verifyAdmin, changeMovieMetadata)
  app.put('/api/v1/movie/sync', verifyAdmin, syncMovie)
}