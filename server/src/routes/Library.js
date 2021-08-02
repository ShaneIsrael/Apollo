const {
  getLibraries, getLibrary, createLibrary, updateLibrary, deleteLibrary, validateLibraryPath, getAllLibrarySeries, getAllLibraryMovies
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/libraries/', getLibraries)
  app.get('/api/v1/library/', getLibrary)
  app.get('/api/v1/library/series', getAllLibrarySeries)
  app.get('/api/v1/library/movies', getAllLibraryMovies)
  app.post('/api/v1/library/', createLibrary)
  app.put('/api/v1/library/', updateLibrary)
  app.delete('/api/v1/library/', deleteLibrary)

  app.post('/api/v1/library/validate', validateLibraryPath)
}