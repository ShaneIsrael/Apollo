const { crawlSeries, crawlMovies, searchMovie, searchTv, getMovie, downloadImage, getTv } = require('./services/')
const { Movie, Series, Metadata } = require('./database/models')
const path = require('path')
const {extensions} = require('./constants')
const short = require('short-uuid')
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function main() {
  try {
    // await crawlSeries(2)
    const series = await Series.findAll({
      include: [Metadata]
    })
    for (const serie of series) {
      if (!serie.Metadatum) {
        continue
      }
      if (!serie.Metadatum.release_date) {
        console.log(`updating: ${serie.name}`)
        await sleep(100)
        const details = await getTv(serie.Metadatum.tmdbId)
        if (details) {
          serie.Metadatum.release_date = details.first_air_date
          serie.Metadatum.save()
        }
      }
    }
  } catch (err) {
    console.log(err)
  }
}
main()