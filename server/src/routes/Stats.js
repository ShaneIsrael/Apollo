const {
  getLibraryStats
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/stats/library/:id', getLibraryStats)
}