module.exports = {
  checkCache: (req, res, next) => {
    const cache = req.app.get('cache')
    if (cache) {
      const key = '__express__' + req.originalUrl
      const cachedResponse = cache.get(key)
      if (cachedResponse) {
        return res.status(200).send(cachedResponse)
      }
    }
    return next()
  }
}