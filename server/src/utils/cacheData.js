module.exports = {
  setCache: (req, value) => {
    const key = '__express__' + req.originalUrl
    const cache = req.app.get('cache')
    cache.set(key, value)
  }
}