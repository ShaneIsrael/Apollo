const {
  getLibraries, getLibrary, getLibraryByTag, createLibrary, updateLibrary, deleteLibrary, validateLibraryPath, getAllLibrarySeries, getAllLibraryMovies, crawl, isLibraryCrawling
} = require('../controllers')

const { verifyAdmin, verifyStandard } = require('../middleware/auth')

module.exports = (app) => {
  app.get('/api/v1/libraries/', verifyStandard, getLibraries)
  app.get('/api/v1/library/', verifyStandard, getLibrary)
  app.get('/api/v1/library/tag', verifyStandard, getLibraryByTag)
  app.get('/api/v1/library/crawling', verifyStandard, isLibraryCrawling)
  app.get('/api/v1/library/series', verifyStandard, getAllLibrarySeries)
  app.get('/api/v1/library/movies', verifyStandard, getAllLibraryMovies)
  app.post('/api/v1/library/', verifyAdmin, createLibrary)
  app.put('/api/v1/library/', verifyAdmin, updateLibrary)
  app.put('/api/v1/library/crawl', verifyAdmin, crawl)
  app.delete('/api/v1/library/', verifyAdmin, deleteLibrary)

  app.post('/api/v1/library/validate', verifyAdmin, validateLibraryPath)
}