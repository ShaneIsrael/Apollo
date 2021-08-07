/* eslint-disable import/no-anonymous-default-export */
import Api from './Api'

export default {
  getByUuid(uuid) {
    return Api().get('/api/v1/series/uuid', {
      params: {
        uuid
      }
    })
  },
  searchById(id, amount) {
    return Api().get(`/api/v1/series/search/${id}/${amount}`)
  },
  searchByTitle(title) {
    return Api().get(`/api/v1/series/search/${title}`)
  },
  changeMetadata(seriesId, tmdbId, create) {
    return Api().put('/api/v1/series/metadata', {
      seriesId,
      tmdbId,
      create
    })
  }
}