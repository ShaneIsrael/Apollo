const chokidar = require('chokidar')
const EventEmitter = require('events').EventEmitter
const logger = require('../logger')

class Observer extends EventEmitter {
  constructor() {
    super()
  }

  watchFolder(folder) {
    try {
      var watcher = chokidar.watch(folder, { persistent: true, ignoreInitial: true })

      const emit = (event, path) => {
        this.emit(event, {
          path
        })
      }

      watcher
        .on('addDir', path => emit('dir-added', path))
        .on('unlinkDir', path => emit('dir-deleted', path))
        .on('add', path => emit('file-added', path))
        .on('change', path => emit('change', path))
        .on('unlink', path => emit('file-deleted', path))

    } catch(error) {
      logger.error(error)
    }
  }
}

module.exports = Observer