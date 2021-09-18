const { crawlSeries, crawlMovies, searchMovie, searchTv, getMovie, downloadImage, getTv } = require('./services/')
const { Movie, Series, Metadata, Season } = require('./database/models')
const path = require('path')
const {extensions} = require('./constants')
const Observer = require('./observer')
const short = require('short-uuid')
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
  // try {
  //   const details = await getTv(31910)
  //   console.log(details.credits.cast.length)
  // } catch (err) {
  //   console.log(err)
  // }
  const observer = new Observer()
  observer.test('/Volumes/Anime Shows')
  console.log(1)
  observer.test('/Volumes/Movies')
  console.log(2)
}
main()