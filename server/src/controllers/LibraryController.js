
/* eslint-disable no-restricted-globals */
const { existsSync, lstatSync } = require('fs')
const { getLibraries, getLibrary, createLibrary, updateLibrary, 
  deleteLibrary, getAllLibrarySeries, getAllLibraryMovies,
  crawlMovies, crawlSeries, isCrawlingActive } = require('../services')

const controller = {}

function calculateDuration(duration) {
  if (duration) {
    let [hours, minutes, seconds] = duration.split(':')
    seconds = (Number(hours) * 60 * 60) + (Number(minutes) * 60) + Number(seconds)
    return seconds
  }
  return 0
}

function validatePath(path) {
  try {   
    const valid = existsSync(path) && lstatSync(path).isDirectory()
    return valid
  } catch (err) {
    return next(err)
  }
}
controller.getLibraries = async (req, res, next) => {
  try {
    const result = await getLibraries()
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.getLibrary = async (req, res, next) => {
  try {
    const result = await getLibrary(res.query.id)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.createLibrary = async (req, res, next) => {
  try {
    const valid = await validatePath(req.body.path)

    if (!valid) return res.status(400).send('Invalid Library Path')
    const { name, path, type, description, misc } = req.body
    if (!name || !path || !type) {
      return res.status(400).send('Missing required fields [name, path, type]')
    }

    const result = await createLibrary(name, path, type, description, misc)
    const crawling = await isCrawlingActive()

    if (!crawling) {
      if (type === 'movie')
        crawlMovies(result.id, req.app.get('wss'))
      if (type === 'series')
        crawlSeries(result.id, req.app.get('wss'))
    }

    return res.status(200).send(result)
  } catch (err) {
    if (err.message === 'Validation error') {
      return res.status(400).send('Library already exists.')
    }
    return next(err)
  }
}

controller.updateLibrary = async (req, res, next) => {
  try {
    const result = await updateLibrary(req.body.id, req.body)
    return res.status(200).send(result)
  } catch (err) {
    return next(err)
  }
}

controller.deleteLibrary = async (req, res, next) => {
  try {
    await deleteLibrary(req.body.id)
    return res.status(200).send('ok')
  } catch (err) {
    return next(err)
  }
}

controller.getAllLibrarySeries = async (req, res, next) => {
  try {
    const library = await getAllLibrarySeries(req.query.id)
    const media = []
    
    for(const series of library.Series) {
      let seasonCount = 0, episodeCount = 0, runtime = 0, width = 0
      if (!series.Metadatum) {
        continue
      }
      for (const season of series.Seasons) {
        if (season.season > 0) seasonCount++
        episodeCount += season.EpisodeFiles.length
        for (const episode of season.EpisodeFiles) {
          const meta = episode.metadata
          if (meta && meta.streams[0].tags) {
            runtime += calculateDuration(meta.streams[0].tags["DURATION"] || meta.streams[0].tags["DURATION-eng"])
            width = meta.streams[0].width || meta.streams[0].codec_width
          }
        }
      }
      media.push({
        id: `${library.tag}-${series.id}`,
        uuid: series.uuid,
        title: series.Metadatum ? series.Metadatum.name || series.name : '',
        poster: series.Metadatum ? series.Metadatum.local_poster_path : '',
        seasons: seasonCount,
        episodes: episodeCount,
        runtime,
        width
      })
    }
    return res.status(200).send(media)
  } catch (err) {
    return next(err)
  }
}

controller.getAllLibraryMovies = async (req, res, next) => {
  try {
    const library = await getAllLibraryMovies(req.query.id)
    const media = []
    
    for(const movie of library.Movies) {
      let runtime = 0, width = 0
      if (!movie.Metadatum) {
        continue
      }
      for (const file of movie.MovieFiles) {
        if (file.metadata && file.metadata.streams[0].tags) {
          runtime = calculateDuration(file.metadata.streams[0].tags["DURATION"] || file.metadata.streams[0].tags["DURATION-eng"])
          const filewidth = file.metadata.streams[0].width || file.metadata.streams[0].codec_width
          if (filewidth > width) width = filewidth
        }
      } 
      media.push({
        id: `${library.tag}-${movie.id}`,
        uuid: movie.uuid,
        title: movie.Metadatum ? movie.Metadatum.name || movie.name : '',
        poster: movie.Metadatum ? movie.Metadatum.local_poster_path : '',
        runtime,
        width,
      })
    }
    return res.status(200).send(media)
  } catch (err) {
    return next(err)
  }
}

controller.validateLibraryPath = async (req, res, next) => {
  try {
    const { path } = req.body
    const valid = validatePath(path)
    return res.status(200).send(valid)
  } catch (err) {
    return next(err)
  }
}

controller.crawl = async (req, res, next) => {
  try {
    
    const { id } = req.body
    const library = await getLibrary(id)
    const crawling = await isCrawlingActive()
    
    if (!crawling) {
      const wss = req.app.get('wss')
      if (library.type === 'movie')
        crawlMovies(library.id, wss)
      if (library.type === 'series')
        crawlSeries(library.id, wss)
    } else {
      return res.status(409).send('A library crawl is currently active')
    }
    return res.status(200).send('ok')
  } catch (err) {
    return next(err)
  }
}

controller.isLibraryCrawling = async (req, res, next) => {
  const { id } = req.query
  try {
    const library = await getLibrary(id)
    return res.status(200).send(library.crawling)
  } catch (err) {
    return next(err)
  }
}

module.exports = controller