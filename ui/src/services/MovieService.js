/* eslint-disable import/no-anonymous-default-export */
import Api from './Api'

export default {
  getById(id) {
    return Api().get('/api/v1/movie', {
      params: {
        id
      }
    })
  },
  getMovieCount(libraryId) {
    return Api().get('/api/v1/movie/count', {
      params: {
        id: libraryId
      }
    })
  },
  getByUuid(uuid) {
    return Api().get('/api/v1/movie/uuid', {
      params: {
        uuid
      }
    })
  },
  getSize(id) {
    return Api().get('/api/v1/movie/stats/size', {
      params: {
        id
      }
    })
  },
  searchById(id, amount) {
    return Api().get(`/api/v1/movie/search/${id}/${amount}`)
  },
  searchByTitle(title) {
    return Api().get(`/api/v1/movie/search/${title}`)
  },
  changeMetadata(movieId, tmdbId, create) {
    return Api().put('/api/v1/movie/metadata', {
      movieId,
      tmdbId,
      create,
    })
  },
  syncMovie(movieId) {
    return Api().put('/api/v1/movie/sync', {
      id: movieId
    })
  }
}