/* eslint-disable import/no-anonymous-default-export */
import Axios from 'axios'
import Api from './Api'

const cancelToken = Axios.CancelToken.source()

export default {
  getConfig() {
    return Api().get('/api/v1/config')
  },
  saveConfig(id, data) {
    return Api().post(`/api/v1/config`, {
      id,
      ...data
    })
  },
  cancel() {
    return cancelToken.cancel()
  }
}