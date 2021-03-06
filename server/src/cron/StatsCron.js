const cron = require('node-cron')
const logger = require('../logger')
const util = require("util")
const getFolderSize = util.promisify(require("get-folder-size"))

const { Stats, Metadata, Series, Movie, MovieFile, Season, Episode, Library, Op } = require('../database/models')
const { existsSync, lstatSync } = require('fs')

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

async function chunkedFindAll(model, params, chunkSize) {
  const ids = (await model.findAll({attributes: ['id'], raw: true})).map(id => id.id)
  let chunkIds = ids.splice(0, chunkSize)
  const results = []
  while (chunkIds.length > 0) {
    params.where = {
      ...params.where, 
      id: {
        [Op.in]: chunkIds
      }
    }
    const data = await model.findAll(params)
    results.push(...data)
    chunkIds = ids.splice(0, chunkSize)
  }
  return results
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
const capitalize = ([firstLetter, ...restOfWord]) => {
  const capitalizedFirstLetter = firstLetter.toUpperCase()
  const restOfWordString = restOfWord.join('')
  return capitalizedFirstLetter + restOfWordString
}

async function createGeneralLibraryStats() {
  async function seriesStats() {
    const libraries = await Library.findAll({
      where: { type: 'series' },
      raw: true
    })
    for (const library of libraries) {
      const stats = {
        general: {},
        "Longest Episode": {},
        "Random": {},
        "Top 5 Genres": {},
      }

      const genreCount = {}
      let seasons = []
      let episodes = []

      let totalSeriesRatingsNotZero = {
        seriesCount: 0,
        ratingsTotal: 0
      }
      let totalGbs = 0
      let totalDuration = 0
      let longestEpisode = {
        seriesId: null,
        duration: 0,
        seasonEpisodeName: null
      }
      let longestEpisodeName = {
        length: 0,
        name: null,
        seriesId: null
      }
      const series = await chunkedFindAll(Series, {
        where: {
          libraryId: library.id
        },
        include: [Metadata, Season, { model: Episode, include: [Season] }],
      }, 10)
      
      for (const serie of series) {
        if (!serie.Metadatum) continue
        seasons = seasons.concat(serie.Seasons)
        episodes = episodes.concat(serie.Episodes)
        if (serie.Metadatum && serie.Metadatum.tmdb_rating && serie.Metadatum.tmdb_rating > 0) {
          totalSeriesRatingsNotZero.seriesCount++
          totalSeriesRatingsNotZero.ratingsTotal += serie.Metadatum.tmdb_rating
        }
        if (serie.Metadatum && serie.Metadatum.genres) {
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
      }


      for (const episode of episodes) {
        if (episode.name && episode.name.length > longestEpisodeName.length) {
          longestEpisodeName.length = episode.name.length
          longestEpisodeName.name = episode.name
          longestEpisodeName.seriesId = episode.seriesId
        }
        if (episode.file_probe_data) {
          if (episode.file_probe_data.streams[0].tags) {
            let duration = calculateDuration(episode.file_probe_data.streams[0].tags["DURATION-eng"])
            totalDuration += duration
            if (episode.Season.season > 0 && duration > longestEpisode.duration) {
              longestEpisode.duration = duration
              longestEpisode.seriesId = episode.seriesId
              longestEpisode.seasonEpisodeName = `Season ${episode.Season.season} Episode ${episode.episode}`
            }
          }
          for (const stream of episode.file_probe_data.streams) {
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

      if (longestEpisode.seriesId && longestEpisodeName.seriesId) {
        const longestEpisodeSeries = await Series.findByPk(longestEpisode.seriesId)
        const longestEpisodeNameSeries = await Series.findByPk(longestEpisodeName.seriesId)
        stats.Random["Longest Episode Name"] = longestEpisodeName.name
        stats.Random["Longest Episode Name Series"] = longestEpisodeNameSeries.name
        stats["Longest Episode"]["Series"] = longestEpisodeSeries.name
        stats["Longest Episode"]["Episode Length"] = secondsToDhms(longestEpisode.duration)
        stats["Longest Episode"]["Episode Details"] = longestEpisode.seasonEpisodeName
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
      stats.general["Average Series Rating"] = `${(totalSeriesRatingsNotZero.ratingsTotal / totalSeriesRatingsNotZero.seriesCount).toFixed(2)} / 10 of ${totalSeriesRatingsNotZero.seriesCount} Series`
      stats.general["Average Episode Length"] = secondsToDhms(totalDuration / episodes.length)
      Stats.create({
        libraryId: library.id,
        tag: 'general-stats',
        json: stats
      })
    }
  }
  async function movieStats() {
    const libraries = await Library.findAll({
      where: { type: 'movie' },
      raw: true
    })
    for (const library of libraries) {
      const stats = {
        general: {},
        "Longest Movie": {},
        "Random": {},
        "Top 5 Genres": {},
      }
      const genreCount = {}

      const movies = await chunkedFindAll(Movie, {
        where: {
          libraryId: library.id
        },
        include: [Metadata, MovieFile],
        raw: true,
        nest: true
      }, 10)

      let files = []
      let totalRatingsNotZero = {
        count: 0,
        ratingsTotal: 0
      }
      let longestMovieName = {
        length: 0,
        name: null,
      }
      for (const movie of movies) {
        if (!movie.Metadatum) continue

        files = files.concat(movie.MovieFiles)

        if (movie.name && movie.name.length > longestMovieName.length) {
          longestMovieName.length = movie.name.length
          longestMovieName.name = capitalize(movie.name)
          longestMovieName.movieId = movie.movieId
        }
        if (movie.Metadatum && movie.Metadatum.tmdb_rating && movie.Metadatum.tmdb_rating > 0) {
          totalRatingsNotZero.count++
          totalRatingsNotZero.ratingsTotal += movie.Metadatum.tmdb_rating
        }
        if (movie.Metadatum.rating && movie.Metadatum.tmdb_rating > highestRatedMovie.rating) {
          highestRatedMovie.rating = movie.Metadatum.tmdb_rating
          highestRatedMovie.name = movie.Metadatum.name
        }
        if (movie.Metadatum && movie.Metadatum.genres) {
          movie.Metadatum.genres.split(',').forEach((genre) => {
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
      }

      let totalGbs = 0
      let totalDuration = 0
      let longestMovie = {
        movieId: null,
        duration: 0,

      }
      for (const file of files) {
        if (file.metadata) {
          file.metadata = JSON.parse(file.metadata)
          if (file.metadata.streams[0].tags) {
            let duration = calculateDuration(file.metadata.streams[0].tags["DURATION-eng"])
            totalDuration += duration
            if (duration > longestMovie.duration) {
              longestMovie.duration = duration
              longestMovie.movieId = file.movieId
            }
          }
          for (const stream of file.metadata.streams) {
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
      let sortable = []
      if (longestMovie.movieId) {
        let longestMovieRow = await Movie.findByPk(longestMovie.movieId)
        stats["Longest Movie"]["Movie"] = longestMovieRow.name
        stats["Longest Movie"]["Movie Length"] = secondsToDhms(longestMovie.duration)
      }
      for (const genre of Object.keys(genreCount)) {
        sortable.push([genre, genreCount[genre]])
      }
      sortable.sort((a, b) => b[1] - a[1])
      sortable.slice(0, 5).forEach(item => { stats["Top 5 Genres"][item[0]] = item[1] })
      stats.general["Total Movies"] = movies.length
      stats.general["Total Movie Files"] = files.length
      stats.general["Total Library Size"] = `${totalGbs.toFixed(2)} TB's`
      stats.general["Total Library Runtime"] = secondsToDhms(totalDuration)
      stats.general["Average Movie Length"] = secondsToDhms(totalDuration / movies.length)
      stats.general["Average Movie Rating"] = `${(totalRatingsNotZero.ratingsTotal / totalRatingsNotZero.count).toFixed(2)} / 10 of ${totalRatingsNotZero.count} Movies`
      stats.Random["Longest Movie Name"] = longestMovieName.name
      Stats.create({
        libraryId: library.id,
        tag: 'general-stats',
        json: stats
      })
    }
  }

  await seriesStats()
  await movieStats()
  logger.info('stats - General Library Stats - DONE')
}

async function createMediaYearsStats() {
  let syears = {}
  let myears = {}

  const mdatas = await chunkedFindAll(Metadata, {
    where: {
      movieId: {
        [Op.not]: null
      }
    },
    attributes: ['release_date'],
    raw: true,
    nest: true
  }, 10)

  for (const meta of mdatas) {
    if (!meta.release_date) continue
    const year = Number(meta.release_date.split('-')[0])
    if (year < 1900) continue
    if (myears[year]) {
      myears[year]++
    } else {
      myears[year] = 1
    }
  }

  const sdatas = await chunkedFindAll(Metadata, {
    where: {
      seriesId: {
        [Op.not]: null
      }
    },
    attributes: ['release_date'],
    raw: true,
    nest: true
  }, 10)

  for (const meta of sdatas) {
    if (!meta.release_date) continue
    const year = Number(meta.release_date.split('-')[0])
    if (year < 1900) continue
    if (syears[year]) {
      syears[year]++
    } else {
      syears[year] = 1
    }
  }
  let combined = []
  for (let year = 1900; year < 2100; year++) {
    seriesYear = syears[year]
    moviesYear = myears[year]
    if (seriesYear || moviesYear) {
      combined.push({
        year,
        series: seriesYear,
        movie: moviesYear
      })
    }
  }
  logger.info('stats - Media Year Stats - DONE')
  return Stats.create({
    tag: 'all-media-years',
    json: combined
  })
}

async function createLibraryFolderSizeStats() {
  try {
    let libraryDataStats = []
    const libraries = await Library.findAll()

    for (const library of libraries) {
      if (!existsSync(library.path)) {
        logger.warn(`stats - Library Size Stats - library could not be found: ${library.path}`)
        continue
      }

      const libraryStat = {
        id: library.id,
        name: library.name,
        type: library.type,
        valueUnit: 'MB',
        items: []
      }
      const libraryEntries = await chunkedFindAll(library.type === 'movie' ? Movie : Series, {
        attributes: ['path', 'name', 'id'],
        where: {
          libraryId: library.id
        },
        raw: true
      }, 10)
      for (const entry of libraryEntries) {
        const valid = existsSync(entry.path) && lstatSync(entry.path).isDirectory()
        if (valid) {
          const size = await getFolderSize(entry.path)
          libraryStat.items.push({
            value: (size / 1000 / 1000).toFixed(2),
            name: entry.name,
            id: entry.id
          })
        } else {
          logger.warn(`stats - Library Size Stats - directory does not exist: ${entry.path}, ${entry.id}`)
        }
      }
      libraryDataStats.push(libraryStat)
    }
    logger.info('stats - Library Size Stats - DONE')
    return Stats.create({
      tag: 'all-library-sizes',
      json: libraryDataStats
    })
  } catch (err) {
    throw err
  }
}

function start() {
  try {
    logger.info('...stats generation cron initialized.')
    // Run at midnight
    cron.schedule('0 0 * * *', async () => {
      logger.info('Running Stats Generation Cronjob...')
      await createGeneralLibraryStats().catch(err => logger.error(err))
      await createMediaYearsStats().catch(err => logger.error(err))
      await createLibraryFolderSizeStats().catch(err => logger.error(err))
    })
  } catch (err) {
    logger.error(err)
  }
}

module.exports = {
  start
}