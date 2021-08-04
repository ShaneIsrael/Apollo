const { crawlSeries, crawlMovies, searchMovie, searchTv, getMovie } = require('./services/')
const { Movie, Series } = require('./database/models')
const path = require('path')
const {extensions} = require('./constants')
const short = require('short-uuid')
console.log(extensions)
async function main() {
  try {
    // await crawlSeries(2)
    const movies = await Movie.findAll()
    const series = await Series.findAll()

    for (const movie of movies) {
      movie.uuid = short.generate()
      movie.save()
    }
    for (const serie of series) {
      serie.uuid = short.generate()
      serie.save()
    }
  } catch (err) {
    console.log(err)
  }
}
main()