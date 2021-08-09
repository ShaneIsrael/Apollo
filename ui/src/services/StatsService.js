/* eslint-disable import/no-anonymous-default-export */
import Axios from 'axios'
import Api from './Api'

const cancelToken = Axios.CancelToken.source()

export default {
  getGeneralLibraryStats(id) {
    return Api().get(`/api/v1/stats/library/${id}`)
  },
  getSeriesYears() {
    return Api().get('/api/v1/stats/series/years')
  },
  getMovieYears() {
    return Api().get('/api/v1/stats/movie/years')
  },
  getMediaReleaseYears() {
    return Api().get('/api/v1/stats/media/years')
  },
  cancel() {
    return cancelToken.cancel()
  }
}