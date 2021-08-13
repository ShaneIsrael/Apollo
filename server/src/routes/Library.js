const {
  getLibraries, getLibrary, getLibraryByTag, createLibrary, updateLibrary, deleteLibrary, validateLibraryPath, getAllLibrarySeries, getAllLibraryMovies, crawl, isLibraryCrawling
} = require('../controllers')

const { verifyAdmin } = require('../middleware/auth')

module.exports = (app) => {
  app.get('/api/v1/libraries/', getLibraries)
  app.get('/api/v1/library/', getLibrary)
  app.get('/api/v1/library/tag', getLibraryByTag)
  app.get('/api/v1/library/crawling', isLibraryCrawling)
  app.get('/api/v1/library/series', getAllLibrarySeries)
  app.get('/api/v1/library/movies', getAllLibraryMovies)
  app.post('/api/v1/library/', verifyAdmin, createLibrary)
  app.put('/api/v1/library/', verifyAdmin, updateLibrary)
  app.put('/api/v1/library/crawl', verifyAdmin, crawl)
  app.delete('/api/v1/library/', verifyAdmin, deleteLibrary)

  app.post('/api/v1/library/validate', verifyAdmin, validateLibraryPath)
}