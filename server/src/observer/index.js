const chokidar = require('chokidar')
const logger = require('../logger')
const { getLibraries } = require('../services')

class Observer {
  constructor() {
    this.watch()
  }
  async watch() {
    try {
      if (this.watcher) {
        this.watcher.close().then(() => console.log('watcher closed'))
      }

      const libraries = await getLibraries()
      if (libraries.length > 0) {
        this.watcher = chokidar.watch(libraries.map(library => library.path), { persistent: true, ignoreInitial: true })

        logger.info(`Observer is watching ${libraries.length} libraries`)

        this.watcher
          .on('addDir', path => handleDirectoryAdded(path))
          .on('unlinkDir', path => handleDirectoryDeleted(path))
          .on('add', path => handleFileAdded(path))
          .on('unlink', path => handleFileDeleted(path))
          .on('change', path => handleChange(path))
      }
    } catch (error) {
      logger.error(error)
    }
  }
}

async function handleDirectoryAdded(path) {
  logger.info(`dir-added -> ${path}`)
}
async function handleDirectoryDeleted(path) {
  logger.info(`dir-deleted -> ${path}`)
}
async function handleFileAdded(path) {
  logger.info(`file-added -> ${path}`)
}
async function handleFileDeleted(path) {
  logger.info(`file-deleted -> ${path}`)
}
async function handleChange(path) {
  logger.info(`changed -> ${path}`)
}

module.exports = Observer