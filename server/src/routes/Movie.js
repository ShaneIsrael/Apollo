const {
  getMovieByUuid,
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/movie/uuid', getMovieByUuid)
}