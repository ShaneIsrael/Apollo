const { crawlSeries, crawlMovies, searchMovie, searchTv, getMovie, downloadImage, getTv } = require('./services/')
const { Movie, Series, Metadata, Season } = require('./database/models')
const path = require('path')
const {extensions} = require('./constants')
const short = require('short-uuid')
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
  let tempVal
  try {
    const movies = await Movie.findAll({
      include: [Metadata]
    })
    for (const movie of movies) {
      if (movie.Metadatum && !movie.Metadatum.name) {
        const details = await getMovie(movie.Metadatum.tmdbId)
        movie.Metadatum.name = details.title
        movie.Metadatum.save()
        await sleep(100)
      }
    }
  } catch (err) {
    console.log(err)
  }
}
main()