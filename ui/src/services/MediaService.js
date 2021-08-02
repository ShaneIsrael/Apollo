/* eslint-disable import/no-anonymous-default-export */
import Api from './Api'

export default {
  getMedia(path) {
    return Api().get('/api/v1/media/', {
      params: {
        library: path
      }
    })
  },
  getImage(path) {
    return Api().get('/api/v1/image/', {
      params: {
        id: path
      }
    })
  }
}