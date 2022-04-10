const {
  getLibraries, getLibrary, getLibraryByTag, createLibrary, updateLibrary, deleteLibrary, validateLibraryPath, getAllLibrarySeries, getAllLibraryMovies, crawl, isLibraryCrawling
} = require('../controllers/LibraryController')

const { verifyAdmin, verifyStandard } = require('../middleware/auth')
const { checkCache } = require('../middleware/cache')
module.exports = (app) => {
  app.get('/api/v1/libraries/', verifyStandard, getLibraries)
  app.get('/api/v1/library/', verifyStandard, getLibrary)
  app.get('/api/v1/library/tag', verifyStandard, getLibraryByTag)
  app.get('/api/v1/library/crawling', verifyStandard, isLibraryCrawling)
  app.get('/api/v1/library/series', verifyStandard, checkCache, getAllLibrarySeries)
  app.get('/api/v1/library/movies', verifyStandard, checkCache, getAllLibraryMovies)
  app.post('/api/v1/library/', verifyAdmin, createLibrary)
  app.put('/api/v1/library/', verifyAdmin, updateLibrary)
  app.put('/api/v1/library/crawl', verifyAdmin, crawl)
  app.delete('/api/v1/library/', verifyAdmin, deleteLibrary)

  app.post('/api/v1/library/validate', verifyAdmin, validateLibraryPath)
}