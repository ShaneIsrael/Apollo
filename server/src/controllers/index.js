
const LibraryController = require('./LibraryController')
const MediaController = require('./MediaController')
const ImageController = require('./ImageController')

module.exports = {
  ...LibraryController,
  ...MediaController,
  ...ImageController
}