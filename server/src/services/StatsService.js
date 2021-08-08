const { Library, Series, Movie, MovieFile, Metadata, Season, EpisodeFile } = require('../database/models')

const service = {}

function calculateDuration(duration) {
  if (duration) {
    const durationSplit = duration.split('.')[0].split(':')
    let [hours, minutes, seconds] = durationSplit
    seconds = Number(seconds)
    seconds += Number(minutes) * 60
    seconds += Number(hours) * 60 * 60
    return seconds
  } else {
    return 0
  }
}
function secondsToDhms(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor(seconds % (3600 * 24) / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 60)

  let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
  let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
  let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
  let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
  return (dDisplay + hDisplay + mDisplay).replace(/,\s*$/, "")
}

async function getMovieLibraryStats(library) {
  const stats = {
    general: {},
    "Top 5 Genres": {}
  }
  const genreCount = {}
  const movies = await Movie.findAll({
    include: [Metadata]
  })
  const files = await MovieFile.findAll()
  for (const movie of movies) {
    movie.Metadatum.genres.split(',').forEach((genre) => {
      if (genre) {
        if (!genreCount[genre]) {
          genreCount[genre] = 1
        }
        else {
          genreCount[genre]++
        }
      }
    })
  }

  let totalGbs = 0
  let totalDuration = 0
  let notCounted = 0
  for (const movie of files) {
    if (movie.metadata) {
      if (movie.metadata.streams[0].tags) {
        totalDuration += calculateDuration(movie.metadata.streams[0].tags["DURATION-eng"])
      }
      console.log(movie.metadata.streams[0].tags)
      for (const stream of movie.metadata.streams) {
        if (!stream.tags) {
          continue
        }
        if (stream.tags['NUMBER_OF_BYTES-eng']) {
          totalGbs += (Number(stream.tags['NUMBER_OF_BYTES-eng']) / 1024 / 1024 / 1024 / 1024)
        }
        else if (stream.tags['NUMBER_OF_BYTES']) {
          totalGbs += (Number(stream.tags['NUMBER_OF_BYTES']) / 1024 / 1024 / 1024 / 1024)
        }
      }
    }
  }
  console.log(`Not Counter: ${notCounted}`)

  let sortable = []
  for (const genre of Object.keys(genreCount)) {
    sortable.push([genre, genreCount[genre]])
  }
  sortable.sort((a, b) => b[1] - a[1])
  sortable.slice(0, 5).forEach(item => { stats["Top 5 Genres"][item[0]] = item[1] })
  stats.general["Total Movies"] = movies.length
  stats.general["Total Movie Files"] = files.length
  stats.general["Total Library Size"] = `${totalGbs.toFixed(2)} TB's`
  stats.general["Total Library Runtime"] = secondsToDhms(totalDuration)
  return stats
}

async function getSeriesLibraryStats(library) {
  const stats = {
    general: {},
    "Top 5 Genres": {}
  }

  const genreCount = {}
  const series = await Series.findAll({
    include: [Metadata]
  })
  const seasons = await Season.findAll()
  const episodes = await EpisodeFile.findAll()
  for (const serie of series) {
    serie.Metadatum.genres.split(',').forEach((genre) => {
      if (genre && genre !== 'Animation') {
        if (!genreCount[genre]) {
          genreCount[genre] = 1
        }
        else {
          genreCount[genre]++
        }
      }
    })

  }

  let totalGbs = 0
  let totalDuration = 0
  for (const episode of episodes) {
    if (episode.metadata) {
      if (episode.metadata.streams[0].tags) {
        totalDuration += calculateDuration(episode.metadata.streams[0].tags["DURATION-eng"])
      }
      for (const stream of episode.metadata.streams) {
        if (!stream.tags) continue
        if (stream.tags['NUMBER_OF_BYTES-eng']) {
          totalGbs += (Number(stream.tags['NUMBER_OF_BYTES-eng']) / 1024 / 1024 / 1024 / 1024)
        }
        if (stream.tags['NUMBER_OF_BYTES']) {
          totalGbs += (Number(stream.tags['NUMBER_OF_BYTES']) / 1024 / 1024 / 1024 / 1024)
        }
      }
    }
  }

  let sortable = []
  for (const genre of Object.keys(genreCount)) {
    sortable.push([genre, genreCount[genre]])
  }
  sortable.sort((a, b) => b[1] - a[1])
  sortable.slice(0, 5).forEach(item => { stats["Top 5 Genres"][item[0]] = item[1] })
  stats.general["Total Series"] = series.length
  stats.general["Total Seasons"] = seasons.length
  stats.general["Total Episodes"] = episodes.length
  stats.general["Total Library Size"] = `${totalGbs.toFixed(2)} TB's`
  stats.general["Total Library Runtime"] = secondsToDhms(totalDuration)
  return stats
}

service.getLibraryStats = async (id) => {
  try {
    const library = await Library.findByPk(id)
    if (library.type === 'series') {
      return (await getSeriesLibraryStats(library))
    }
    if (library.type === 'movie') {
      return (await getMovieLibraryStats(library))
    }
  } catch (err) {
    throw err
  }
}

module.exports = service