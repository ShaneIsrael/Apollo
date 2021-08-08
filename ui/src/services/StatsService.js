/* eslint-disable import/no-anonymous-default-export */
import Api from './Api'

export default {
  getGeneralLibraryStats(id) {
    return Api().get(`/api/v1/stats/library/${id}`)
  },
}