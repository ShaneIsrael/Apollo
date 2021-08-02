const { crawlSeries, crawlMovies, searchMovie, searchTv, getMovie } = require('./services/')

async function main() {
  try {
    await crawlSeries(1)
  } catch (err) {
    console.log(err)
  }
}
main()