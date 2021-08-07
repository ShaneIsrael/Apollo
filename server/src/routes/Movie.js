const {
  getMovieByUuid,
  changeMovieMetadata,
  searchMovieById,
  searchMovieByTitle,
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/movie/uuid', getMovieByUuid),
  app.get('/api/v1/movie/search/:id/:amount', searchMovieById)
  app.get('/api/v1/movie/search/:title', searchMovieByTitle)
  app.put('/api/v1/movie/metadata', changeMovieMetadata)
}