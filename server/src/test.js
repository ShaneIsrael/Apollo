const { crawlSeries, crawlMovies, searchMovie, searchTv, getMovie, downloadImage, getTv } = require('./services/')
const { Movie, Series, Metadata } = require('./database/models')
const path = require('path')
const {extensions} = require('./constants')
const short = require('short-uuid')
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
  let tempVal
  try {
    // await crawlSeries(2)
    const movies = await Movie.findAll({
      include: [Metadata]
    })
    for (const movie of movies) {
      // const details = await getTv(serie.Metadatum.tmdbId)
      tempVal = movie
      console.log(`working: ${movie.name}`)
      if (movie.Metadatum && movie.Metadatum.tmdb_poster_path)
        await downloadImage(movie.Metadatum.tmdb_poster_path, 'w780')
      if (movie.Metadatum && movie.Metadatum.tmdb_backdrop_path)
        await downloadImage(movie.Metadatum.tmdb_backdrop_path, 'original')
      await sleep(100)
    }
  } catch (err) {
    console.log(tempVal.Metadatum)
    console.log(err)
  }
}
main()