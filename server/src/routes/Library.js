const {
  getLibraries, getLibrary, createLibrary, updateLibrary, deleteLibrary, validateLibraryPath, getAllLibrarySeries, getAllLibraryMovies, crawl, isLibraryCrawling
} = require('../controllers')


module.exports = (app) => {
  app.get('/api/v1/libraries/', getLibraries)
  app.get('/api/v1/library/', getLibrary)
  app.get('/api/v1/library/crawling', isLibraryCrawling)
  app.get('/api/v1/library/series', getAllLibrarySeries)
  app.get('/api/v1/library/movies', getAllLibraryMovies)
  app.post('/api/v1/library/', createLibrary)
  app.put('/api/v1/library/', updateLibrary)
  app.put('/api/v1/library/crawl', crawl)
  app.delete('/api/v1/library/', deleteLibrary)

  app.post('/api/v1/library/validate', validateLibraryPath)
}