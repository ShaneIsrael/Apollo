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
  changeMetadata(seriesId, tmdbId) {
    return Api().put('/api/v1/series/metadata', {
      seriesId,
      tmdbId,
    })
  }
}