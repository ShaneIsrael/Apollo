import React from 'react';
import moment from 'moment'
import ReactPlayer from 'react-player'
import { useHistory, useParams } from 'react-router-dom'
import { Grid, Box, Typography, Paper, Button, Stack, Rating, Divider, Container } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { SeasonCoverCard, CastCoverCard, GeneralCoverCard, Loading, MetadataModal } from '../components'
import { SeriesService } from '../services'
import FixMatch from '../components/widgets/FixMatch';
import { canDisplayToUser, getImagePath, secondsToDhms } from '../components/utils';
import background from '../assets/blurred-background-01.png'
import { useTheme } from '@emotion/react';
// blurred-texture-background02

const Series = ({ sidebarOpen, setStats }) => {
  const { id } = useParams()
  const [series, setSeries] = React.useState(null)
  const [fixMatchOpen, setFixMatchOpen] = React.useState(false)
  const [refreshingMetadata, setRefreshingMetadata] = React.useState(false)
  const [syncingFiles, setSyncingFiles] = React.useState(false)
  const [metadataOpen, setMetadataOpen] = React.useState(false)
  const [metaViewData, setMetaViewData] = React.useState(null)

  const history = useHistory()
  const theme = useTheme()

  function createStats() {
    if (series && series.Seasons) {
      const seasonCount = series.Seasons.filter(s => s.season !== 0).length
      let episodeCount = 0
      let time = 0
      for (const season of series.Seasons) {
        if (season.season !== 0 && season.Episodes) {
          episodeCount += season.Episodes.length
          for (const episode of season.Episodes) {
            if (episode.file_probe_data && episode.file_probe_data.streams) {
              let videoStream = episode.file_probe_data.streams[0]
              let frames = 0
              if (videoStream.nb_frames)
                frames = videoStream.nb_frames
              else if (videoStream.tags && (videoStream.tags['NUMBER_OF_FRAMES'] || videoStream.tags['NUMBER_OF_FRAMES-eng'])) {
                frames = videoStream.tags['NUMBER_OF_FRAMES'] || videoStream.tags['NUMBER_OF_FRAMES-eng']
              }
              const framerate = (videoStream.avg_frame_rate.split('/')[0] / videoStream.avg_frame_rate.split('/')[1])
              if (frames > 0) {
                time += frames / framerate
              }
            }
          }
        }
      }
      time = secondsToDhms(time).replace(/,/g, '')
      return (
        <Typography variant="overline" color="primary" noWrap sx={{ fontSize: 15 }}>
          {`${seasonCount} ${seasonCount === 1 ? 'Season' : 'Seasons'} | ${episodeCount} ${episodeCount === 1 ? 'Episode' : 'Episodes'} ${time ? `| ${time}` : ''}`}
        </Typography>
      )
    }
    return <></>
  }

  React.useEffect(() => {
    async function fetch() {
      const resp = (await SeriesService.getById(id)).data
      const size = (await SeriesService.getSize(id)).data
      if (resp.Metadatum) {
        setMetaViewData([
          {
            title: "General Info",
            data: {
              "TMDb ID": resp.Metadatum.tmdbId,
              "IMDB ID": resp.Metadatum.imdbId || "Unknown",
              "System Path": resp.path,
              "Number of Seasons": resp.Seasons.length > 0 ? resp.Seasons.length : 'No Seasons',
              "Number of Episodes": resp.Seasons.length > 0 ? resp.Seasons.map(s => s.Episodes.length).reduce((a, c) => a + c) : 'No Episodes',
              "Size on Disk (GB)": size ? `${(size / 1000).toFixed(2)} GB` : 'No Size Recorded'
            }
          },
        ])
      }
      setSeries(resp)
    }
    fetch()
  }, [id])

  React.useEffect(() => {
    setStats(createStats())
  }, [series])

  const handleFixMatch = () => {
    setFixMatchOpen(true)
  }

  const handleFixMatchClose = (goback) => {
    if (goback) {
      return history.goBack()
    }
    return setFixMatchOpen(false)
  }

  const handleRefreshMetadata = async () => {
    try {
      setRefreshingMetadata(true)
      await SeriesService.changeMetadata(series.id, series.Metadatum.tmdbId)
      const seriesResp = (await SeriesService.getById(id)).data
      setSeries(seriesResp)
    } catch (err) {
      console.error(err)
    }
    setRefreshingMetadata(false)
  }

  const handleSyncFiles = async () => {
    try {
      setSyncingFiles(true)
      await SeriesService.syncSeries(series.id)
      const seriesResp = (await SeriesService.getById(id)).data
      setSeries(seriesResp)
    } catch (err) {
      console.error(err)
    }
    setSyncingFiles(false)
  }

  const hidden = !canDisplayToUser()

  if (!series) return (
    <Grid sx={{ pt: 9 }} container>
      <Grid sx={{ height: '50vh ' }} container item justifyContent="center" alignItems="center">
        <Loading disableShrink size={100} />
      </Grid>
    </Grid>
  )
  if (!series.Metadatum) {
    return <FixMatch
      open={true} close={handleFixMatchClose} setMatch={setSeries} current={series} type="series" />
  }
  const backdropImage = series ? getImagePath(`/api/v1/image/${series.Metadatum.local_backdrop_path}`) : ''
  const genres = series ? series.Metadatum.genres.split(',').filter((e) => e.toLowerCase() !== 'animation').join(', ') : ''

  return (
    <Box sx={{ position: 'relative', flexGrow: 1, maxHeight: '100%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0 } }}>
      <MetadataModal title="Local System Metadata" open={metadataOpen} close={() => setMetadataOpen(false)} metadata={metaViewData} />
      <FixMatch open={fixMatchOpen} close={handleFixMatchClose} setMatch={setSeries} current={series} type="series" />
      <Box sx={{
        position: 'absolute',
        zIndex: 1,
        left: 0,
        right: 0,
        // filter: 'blur(0px) brightness(100%)',
        backgroundImage: `url("${backdropImage}")`, backgroundSize: 'cover', height: '365px',
        backgroundPosition: '50% 15%'
      }}>
      </Box>
      {/* <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: (theme) => theme.palette.mode === 'dark' ? `url("${background}") no-repeat center center fixed` : '',
        backgroundSize: '100% 100%', width: '100%', height: '100vh',
        filter: 'brightness(35%)',
        // filter: 'opacity(35%)'
      }} /> */}
      <Box sx={{ position: 'relative', zIndex: 2, pl: 3, pr: 3, pt: 3, flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid container item direction="column" alignItems="center" spacing={2} md={4}>
            <Grid item>
              <GeneralCoverCard cover={series.Metadatum.local_poster_path} width={250} height={375} />
            </Grid>
            <Grid item>
              <Rating
                name="rating-read-only"
                value={series.Metadatum.tmdb_rating / 2} precision={0.5} readOnly
                size="large"
              />
            </Grid>
            {!hidden &&
              <Grid item>
                <Box sx={{ width: '250px' }}>
                  <Stack direction="column" spacing={1}>
                    <Button onClick={() => setMetadataOpen(true)} variant="outlined" size="small">
                      View Metadata
                    </Button>
                    <Button onClick={handleRefreshMetadata} variant="outlined" size="small" disabled={refreshingMetadata}
                      startIcon={refreshingMetadata &&
                        <RefreshIcon sx={{
                          animation: 'spinright 1s infinite linear'
                        }} fontSize="inherit" />
                      }>
                      Refresh Metadata
                    </Button>
                    <Button onClick={handleSyncFiles} variant="outlined" size="small"
                      disabled={syncingFiles}
                      startIcon={syncingFiles &&
                        <RefreshIcon sx={{
                          animation: 'spinright 1s infinite linear'
                        }} fontSize="inherit" />
                      }
                    >
                      Sync Series Files
                    </Button>
                    <Button onClick={handleFixMatch} variant="outlined" size="small">
                      Fix Match
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            }
            <Grid item>
              <Paper sx={{ width: '250px', pl: 2, pr: 2, pt: 1, pb: 1, backgroundColor: 'rgba(0,0,0,0)' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 'bold', color: 'primary.main' }} variant="subtitle2">Premiered {moment(series.Metadatum.release_date).format('MMMM Do, YYYY')}</Typography>
              </Paper>
            </Grid>
          </Grid>
          <Grid container item direction="column" alignItems="space-evenly" spacing={2} md={8}>
            <Grid container justifyContent="flex-start" alignItems="center" sx={{ pl: 4, height: '360px', display: { xs: 'none', sm: 'none', md: 'inherit' } }}>
              {/* This grid just pushes the title down into the correct position */}
            </Grid>
            <Grid item sx={{ display: { xs: 'none', sm: 'none', md: 'inherit' } }}>
              <Grid container justifyContent="flex-start">
                <Typography sx={{ position: 'relative', pt: 0, fontWeight: 900, fontSize: 36 }} variant="h1">
                  {series.Metadatum.name}
                </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Box sx={{ width: '100%', pl: 0, pt: 0, pb: 2, pr: 1, height: 'auto', maxHeight: '285px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0 } }}>
                <Grid container justifyContent="flex-start" alignItems="center">
                  <Typography sx={{ fontSize: 16, fontWeight: 'bold', color: 'secondary.main' }} variant="subtitle2">{genres}</Typography>
                </Grid>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="body1" sx={{ pr: 1 }}>
                  {series.Metadatum.overview}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Grid container item direction="column" md={4}></Grid>
          <Grid container item direction="row" sx={{ display: { md: series.Metadatum.cast && series.Metadatum.cast.length > 0 ? 12 : 'none' } }} justifyContent="center">
            <Box sx={{ display: 'flex', padding: 2, maxWidth: '80vw', overflowX: 'auto' }}>
              {
                series.Metadatum.cast && series.Metadatum.cast.sort((a, b) => a.order - b.order).map((cast, i) => <CastCoverCard key={i} cast={cast} size={120} />)
              }
            </Box>
          </Grid>
          <Grid container item direction="column" sx={{ display: { md: series.Seasons.length > 0 ? 12 : 'none' } }} alignItems="center">
            <Box sx={{ maxHeight: '520px', padding: 2, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0 } }}>
              <Grid container spacing={2} justifyContent="center">
                {
                  series.Seasons.map((season, i) => <Grid item key={i}><SeasonCoverCard seriesId={id} season={season.season} cover={season.local_poster_path || series.Metadatum.local_poster_path} width={140} height={210} /></Grid>)
                }
              </Grid>
            </Box>
          </Grid>
          <Grid container item direction="row" alignItems="center" justifyContent="center">
            {
              series.Metadatum.videos && series.Metadatum.videos.filter(video => (video.site === 'YouTube')).map(video => <Grid item sx={{ width: 355, mb: 1, mr: 1, ml: 1 }}>
                <Typography noWrap sx={{ fontWeight: 'bold', fontSize: 14 }} align="center" color="primary">{video.name}</Typography>
                <ReactPlayer
                  height={200}
                  width={355}
                  controls
                  url={`https://youtube.com/watch?v=${video.key}`} /></Grid>)
            }
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default Series