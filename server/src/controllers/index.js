
const LibraryController = require('./LibraryController')
const MediaController = require('./MediaController')
const ImageController = require('./ImageController')
const SeriesController = require('./SeriesController')
const MovieController = require('./MovieController')
const StatsController = require('./StatsController')

module.exports = {
  ...LibraryController,
  ...MediaController,
  ...ImageController,
  ...SeriesController,
  ...MovieController,
  ...StatsController
}