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
}