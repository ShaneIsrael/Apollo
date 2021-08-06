const {
  getMovieByUuid,
  changeMovieMetadata,
  searchMovieById
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/movie/uuid', getMovieByUuid),
  app.get('/api/v1/movie/search/:id/:amount', searchMovieById)
  app.put('/api/v1/movie/metadata', changeMovieMetadata)
}