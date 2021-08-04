
const LibraryController = require('./LibraryController')
const MediaController = require('./MediaController')
const ImageController = require('./ImageController')
const SeriesController = require('./SeriesController')
const MovieController = require('./MovieController')

module.exports = {
  ...LibraryController,
  ...MediaController,
  ...ImageController,
  ...SeriesController,
  ...MovieController,
}