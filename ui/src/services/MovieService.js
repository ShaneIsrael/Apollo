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
  changeMetadata(movieId, tmdbId) {
    return Api().put('/api/v1/movie/metadata', {
      movieId,
      tmdbId,
    })
  }
}