const NodeCache = require('node-cache')

class Cache {

  constructor(ttlSeconds) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false })
  }

  get(key) {
    const value = this.cache.get(key)
    return value 
  }

  set(key, value) {
    if (typeof value === 'number') {
      this.cache.set(key, String(value))
    } else {
      this.cache.set(key, value)
    }
  }

  del(keys) {
    this.cache.del(keys)
  }

  delStartWith(startStr = '') {
    if (!startStr) {
      return
    }

    const keys = this.cache.keys();
    for (const key of keys) {
      if (key.indexOf(startStr) === 0) {
        this.del(key)
      }
    }
  }

  flush() {
    this.cache.flushAll()
  }
}

module.exports = Cache