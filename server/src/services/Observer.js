const chokidar = require('chokidar')
const EventEmitter = require('events').EventEmitter
const logger = require('../logger')

const { getLibraries } = require('./index')
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

const observer = new Observer()

const initLibraryObserver = async () => {  
  const libraries = await getLibraries()
  logger.info(`Library Observer initialized, watching ${libraries.length} libraries`)

  if (libraries.length > 0) {
    observer.on('file-added', data => {
      logger.info(`file-added -> ${data.path}`)
    })
    observer.on('file-deleted', data => {
      logger.info(`file-deleted -> ${data.path}`)
    })
    observer.on('dir-added', data => {
      logger.info(`dir-added -> ${data.path}`)
    })
    observer.on('dir-deleted', data => {
      logger.info(`dir-deleted -> ${data.path}`)
    })
    observer.on('change', data => {
      logger.info(`change -> ${data.path}`)
    })
    observer.watchFolder(libraries.map(library => library.path))
    
  }
}

module.exports = {
  initLibraryObserver,
}