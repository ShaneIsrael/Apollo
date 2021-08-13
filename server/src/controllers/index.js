
const LibraryController = require('./LibraryController')
const MediaController = require('./MediaController')
const ImageController = require('./ImageController')
const SeriesController = require('./SeriesController')
const MovieController = require('./MovieController')
const StatsController = require('./StatsController')
const ConfigController = require('./ConfigController')

module.exports = {
  ...LibraryController,
  ...MediaController,
  ...ImageController,
  ...SeriesController,
  ...MovieController,
  ...StatsController,
  ...ConfigController
}