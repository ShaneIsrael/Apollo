
const LibraryService = require('./LibraryService')
const SeriesService = require('./SeriesService')
const MovieService = require('./MovieService')
const TmdbService = require('./TmdbService')
const StatsService = require('./StatsService')

module.exports = {
  ...LibraryService,
  ...SeriesService,
  ...MovieService,
  ...TmdbService,
  ...StatsService,
}