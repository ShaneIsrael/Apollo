/* eslint-disable import/no-anonymous-default-export */
import Api from './Api'

export default {
  getById(id) {
    return Api().get('/api/v1/series', {
      params: {
        id
      }
    })
  },
  getSeriesCount(libraryId) {
    return Api().get('/api/v1/series/count', {
      params: {
        id: libraryId
      }
    })
  },
  getEpisodeCount(libraryId) {
    return Api().get('/api/v1/series/episode/count', {
      params: {
        id: libraryId
      }
    })
  },
  getSeasonCount(libraryId) {
    return Api().get('/api/v1/series/season/count', {
      params: {
        id: libraryId
      }
    })
  },
  getByUuid(uuid) {
    return Api().get('/api/v1/series/uuid', {
      params: {
        uuid
      }
    })
  },
  getSize(id) {
    return Api().get('/api/v1/series/stats/size', {
      params: {
        id
      }
    })
  },
  getSeasonAndEpisodes(seriesId, season) {
    return Api().get(`/api/v1/series/${seriesId}/season/${season}`)
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
  },
  refreshSeasonEpisodesMetadata(seasonId) {
    return Api().put('/api/v1/series/season/episodes/metadata', {
      id: seasonId
    })
  },
  probeSeasonEpisodes(seasonId) {
    return Api().put('/api/v1/series/season/probe', {
      id: seasonId
    })
  },
  syncSeries(seriesId) {
    return Api().put('/api/v1/series/sync', {
      id: seriesId
    })
  }
}