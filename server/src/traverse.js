const { readdirSync, writeFileSync, readFileSync } = require('fs')
const path = require('path')
const ffprobe = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')

const db = JSON.parse(readFileSync('media.json'))
 
async function traverseMovies(libraryRoot) {
  const directories = getDirectories(libraryRoot)
  for (const dir of directories) {
    const files = getFiles(path.join(libraryRoot, dir))
    let movieFile
    console.log(`-- ${dir}/`)
    for (const file of files) {
      const filename = path.parse(file).name
      if (dir === filename) {
        movieFile = file
        break
      }
    }
    if (!movieFile) {
      console.log(`\tCould not identify media file`)
      continue
    }
    if (movieExists(libraryRoot, movieFile)) {
      console.log('\tExists')
      continue
    }
    const filedata = await probe(path.join(libraryRoot, dir, movieFile))
    if (!filedata) continue

    const data = {
      filename: movieFile,
      video: {},
      audio: []
    }

    for (const stream of filedata.streams) {
      if (stream.codec_type === 'video') {
        data.video = stream
      }
      if (stream.codec_type === 'audio') {
        data.audio.push(stream)
      }
    }

    addMovie(libraryRoot, dir, data)
  }
  writeFileSync('media.json', JSON.stringify(db, null, 2));
}

async function traverseSeries(libraryRoot) {
  const directories = getDirectories(libraryRoot)
  for (const series of directories) {
    const seasons = getDirectories(path.join(libraryRoot, series))
    console.log(`-- ${series}/`)
    for (const season of seasons) {
      console.log(`\t${season}/`)
      const episodes = getFiles(path.join(libraryRoot, series, season))
      let episodeFile
      for (const episode of episodes) {
        episodeFile = episode
        const filename = path.parse(episode).name
        const seasonEpisodeParse = filename.match(/[sS]([0-9]+|[0-9]+)[eE]([0-9]+|[0-9]+)/)
        if (seasonEpisodeParse) {
          const seasonNumber = seasonEpisodeParse[1]
          const episodeNumber = Number(seasonEpisodeParse[2])
          const episodeTitleSplit = filename.toLowerCase().split(` - ${seasonEpisodeParse[0].toLowerCase()} - `)
          let episodeTitle = ''
          if (episodeTitleSplit.length === 2) {
            episodeTitle = episodeTitleSplit[1]
          }
          console.log(`\t\t${episodeNumber} - ${episodeTitle}`)
          if (episodeExists(libraryRoot, series, seasonNumber, episodeNumber)) {
            console.log(`\t\t\tEpisode exists: ${episode}`)
            continue
          }
          const filedata = await probe(path.join(libraryRoot, series, season, episode))
          if (!filedata) {
            console.log(`\t\t\tCould not parse data: ${episode}`)
          }
          const data = {
            filename: episode,
            video: {},
            audio: []
          }
          for (const stream of filedata.streams) {
            if (stream.codec_type === 'video') {
              data.video = stream
            }
            if (stream.codec_type === 'audio') {
              data.audio.push(stream)
            }
          }
          addSeries(libraryRoot, series, seasonNumber, episodeNumber, episodeTitle, data)
        } else {
          console.log(`\t\t\tUnable to parse episode: ${episode}`)
        }
      }
    }
  }
  writeFileSync('media.json', JSON.stringify(db, null, 2));
}

function movieExists(library, movie) {
  if (!db[library]) return false
  if (db[library].media[movie]) return true
  return false
}

function episodeExists(library, series, season, episode) {
  if (!db[library]) return false
  if (!db[library].media[series]) return false
  if (!db[library].media[series].seasons[season]) return false
  for (const ep of db[library].media[series].seasons[season]) {
    if (episode === ep.episode) return true
  }
  return false
}

function addMovie(library, title, data) {
  if (!db[library]) {
    db[library] = {
      type: 'movie',
      media: {}
    }
  }
  db[library].media[title] = {
    data
  }
}
function addSeries(library, series, season, episode, title, data) {
  if (!db[library]) {
    return db[library] = {
      type: 'series',
      media: {}
    }
  }
  if (!db[library].media[series]) {
    return db[library].media[series] = {
      seasons: {
        [season]: [
          {
            episode,
            title,
            data,
          }
        ]
      }
    }
  }
  if (!db[library].media[series].seasons[season]) {
    return db[library].media[series].seasons[season] = [
      {
        episode,
        title,
        data
      }
    ]
  }
  return db[library].media[series].seasons[season].push({
    episode,
    title,
    data,
  })
}

async function probe(path) {
  let info
  try {
    info = await ffprobe(path, { path: ffprobeStatic.path })
  } catch (err) {
    console.error(`\t${err.message}`)
  }
  return info
}

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name).sort()

const getFiles = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => !dirent.isDirectory())
    .map(dirent => dirent.name)


traverseMovies('/Volumes/Movies')
// traverseSeries('/Volumes/Anime Shows')