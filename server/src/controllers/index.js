
const LibraryController = require('./LibraryController')
const ImageController = require('./ImageController')
const SeriesController = require('./SeriesController')
const MovieController = require('./MovieController')
const StatsController = require('./StatsController')
const ConfigController = require('./ConfigController')

module.exports = {
  ...LibraryController,
  ...ImageController,
  ...SeriesController,
  ...MovieController,
  ...StatsController,
  ...ConfigController
}