/* eslint-disable import/no-anonymous-default-export */
import Api from './Api'

export default {
  getLibraries() {
    return Api().get('/api/v1/libraries/')
  },
  validateLibraryPath(path) {
    return Api().post('/api/v1/library/validate', {
      path
    })
  },
  createLibrary(name, path, type) {
    return Api().post('/api/v1/library', {
      name, path, type
    })
  },
  updateLibrary(update) {
    return Api().put('/api/v1/library', {
      ...update
    })
  },
  deleteLibrary(id) {
    return Api().delete('/api/v1/library', {
      data: {
        id
      }
    })
  },
  getAllLibrarySeries(id) {
    return Api().get('/api/v1/library/series', {
      params: {
        id
      }
    })
  },
  getAllLibraryMovies(id) {
    return Api().get('/api/v1/library/movies', {
      params: {
        id
      }
    })
  }
}