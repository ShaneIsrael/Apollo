const path = require('path')
const fs = require('fs')
const axios = require('axios')
const download = require('image-downloader')

const { tmdb_api_key, tmdb_read_access_token } = require('../config/config.json')[process.env.NODE_ENV || 'dev']
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
        language: 'en-US',
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
        language: 'en-US',
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
        language: 'en-US',
        // append_to_response: 'images'
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
        language: 'en-US',
      },
      ...options
    })).data
    return res
  } catch (err) {
    throw err
  }
}

service.downloadImage = async (tmdbSrc) => {
  try {
    const url = `https://image.tmdb.org/t/p/w500${tmdbSrc}`
    const checkPath = path.resolve(__dirname, `../../images${tmdbSrc}`)
    if (fs.existsSync(checkPath)) {
      return checkPath
    }
    const { filename } = await download.image({
      url,
      dest: path.resolve(__dirname, '../../images/')
    })
    return filename
  } catch (err) {
    throw err
  }
}

module.exports = service