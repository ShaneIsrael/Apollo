module.exports = {
  setCache: (req, value) => {
    const cache = req.app.get('cache')
    if (cache) {
      const key = '__express__' + req.originalUrl
      cache.set(key, value)
    }
  }
}