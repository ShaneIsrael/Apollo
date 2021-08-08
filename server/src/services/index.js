
const LibraryService = require('./LibraryService')
const MediaService = require('./MediaService')
const SeriesService = require('./SeriesService')
const MovieService = require('./MovieService')
const TmdbService = require('./TmdbService')
const StatsService = require('./StatsService')

module.exports = {
  ...LibraryService,
  ...MediaService,
  ...SeriesService,
  ...MovieService,
  ...TmdbService,
  ...StatsService,
}