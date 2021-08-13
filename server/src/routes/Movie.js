const {
  getMovieByUuid,
  changeMovieMetadata,
  searchMovieById,
  searchMovieByTitle,
} = require('../controllers')
const { verifyAdmin, verifyStandard } = require('../middleware/auth')

module.exports = (app) => {
  app.get('/api/v1/movie/uuid', verifyStandard, getMovieByUuid),
  app.get('/api/v1/movie/search/:id/:amount', verifyStandard, searchMovieById)
  app.get('/api/v1/movie/search/:title', verifyStandard, searchMovieByTitle)
  app.put('/api/v1/movie/metadata', verifyAdmin, changeMovieMetadata)
}