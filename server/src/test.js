// const { crawlSeries, crawlMovies, searchMovie, searchTv, getMovie, downloadImage, getTv } = require('./services/')
const { Movie, Series, Metadata, Season, Episode } = require('./database/models')
// const path = require('path')
// const {extensions} = require('./constants')
// const Observer = require('./observer')
// const short = require('short-uuid')
// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function main() {
//   // try {
//   //   const details = await getTv(31910)
//   //   console.log(details.credits.cast.length)
//   // } catch (err) {
//   //   console.log(err)
//   // }m
//   const observer = new Observer()
//   observer.test('/Volumes/Anime Shows')
//   console.log(1)
//   observer.test('/Volumes/Movies')
//   console.log(2)
// }
// main()


async function main() {
  // const seriesIds = (await Series.findAll({attributes: ['id'], raw: true})).map(id => id.id)
  // let chunkIds = seriesIds.splice(0, 10)
  // while (chunkIds.length > 0) {
  //   console.log(chunkIds)
  //   chunkIds = seriesIds.splice(0, 10)
  // }
  // console.log(seriesIds)
  const series = await Series.findOne({
    include: [Metadata, Season, { model: Episode, include: [Season] }],
    raw: true,
    nest: true
  })
  console.log(series)
}
main()

// async function compress() {
// const compress_images = require("compress-images")

// const INPUT_path_to_your_images = "/Users/shane/Library/Apollo/images/*.{jpg,JPG,jpeg,JPEG,png}";
// const OUTPUT_path = "/Users/shane/Library/Apollo/compressed/";

// compress_images(INPUT_path_to_your_images, OUTPUT_path, { 
//     compress_force: false, statistic: true, autoupdate: true }, false,
//                 { jpg: { engine: "mozjpeg", command: ["-quality", "60"] } },
//                 { png: { engine: "pngquant", command: ["--quality=20-50", "-o"] } },
//                 { svg: { engine: false, command: false } },
//                 { gif: { engine: false, command: false } },
//   function (error, completed, statistic) {
//     console.log("-------------");
//     console.log(error);
//     console.log(completed);
//     console.log(statistic);
//     console.log("-------------");
//   }
// )
// }
// compress()