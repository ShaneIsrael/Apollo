const path = require('path')
const fs = require('fs')
const axios = require('axios')
const download = require('image-downloader')
const config = require('../config')[process.env.NODE_ENV || 'dev']
const { tmdb_api_key, tmdb_read_access_token } = require('../config/index')[process.env.NODE_ENV || 'dev']
const api = axios.create({ baseURL: 'https://api.themoviedb.org/3' })

const options = {
  headers: {
    Authorization: `Bearer ${tmdb_read_access_token}`
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const service = {}

service.searchTv = async (string) => {
  const query = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  try {
    const res = (await api.get('search/tv', {
      params: { 
        language: 'en-US,null',
        query,
        include_adult: true
      },
      ...options
    })).data
    return res
  } catch (err) {
    throw err
  }
}
service.searchMovie = async (string) => {
  const query = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  try {
    const res = (await api.get('search/movie', {
      params: { 
        language: 'en-US,null',
        query,
        include_adult: true,
      },
      ...options
    })).data
    return res
  } catch (err) {
    throw err
  }
}
service.getMovie = async (tmdbId) => {
  try {
    const res = (await api.get(`movie/${tmdbId}`, {
      params: { 
        language: 'en-US,null',
        append_to_response: 'images'
      },
      ...options
    })).data
    return res
  } catch (err) {
    throw err
  }
}
service.getTv = async (tmdbId) => {
  try {
    const res = (await api.get(`tv/${tmdbId}`, {
      params: { 
        language: 'en-US,null',
        append_to_response: 'images'
      },
      ...options
    })).data
    return res
  } catch (err) {
    throw err
  }
}

// "backdrop_sizes": [
//   "w300",
//   "w780",
//   "w1280",
//   "original"
// ],
// "logo_sizes": [
//   "w45",
//   "w92",
//   "w154",
//   "w185",
//   "w300",
//   "w500",
//   "original"
// ],
// "poster_sizes": [
//   "w92",
//   "w154",
//   "w185",
//   "w342",
//   "w500",
//   "w780",
//   "original"
// ],
// "profile_sizes": [
//   "w45",
//   "w185",
//   "h632",
//   "original"
// ],
// "still_sizes": [
//   "w92",
//   "w185",
//   "w300",
//   "original"
// ]
service.downloadImage = async (tmdbSrc, size) => {
  try {
    if (!tmdbSrc) return null
    const url = `https://image.tmdb.org/t/p/${size ? size : 'w500'}/${tmdbSrc}`
    const checkPath = path.join(config.appdata, config.imageDir, tmdbSrc)
    if (fs.existsSync(checkPath)) {
      return checkPath
    }
    const { filename } = await download.image({
      url,
      dest: path.join(config.appdata, config.imageDir)
    })
    return filename
  } catch (err) {
    throw err
  }
}

module.exports = service