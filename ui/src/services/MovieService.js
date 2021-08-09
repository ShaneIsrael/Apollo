/* eslint-disable import/no-anonymous-default-export */
import Api from './Api'

export default {
  getByUuid(uuid) {
    return Api().get('/api/v1/movie/uuid', {
      params: {
        uuid
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
}