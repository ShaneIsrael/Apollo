import React from 'react';
import { useHistory, useParams } from 'react-router-dom'
import moment from 'moment'
import { Grid, Box, Typography, Paper, Button, Stack, Rating, Divider } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { GeneralCoverCard, Loading, MetadataModal, CastCoverCard } from '../components'
import { MovieService } from '../services';
import FixMatch from '../components/widgets/FixMatch';
import { canDisplayToUser, getImagePath } from '../components/utils';
import background from '../assets/blurred-background-01.png'
import { useTheme } from '@emotion/react';

function createMetadata(movie, size) {

  const meta = [
    {
      title: "General Info",
      data: {
        "TMDb ID": movie.Metadatum.tmdbId,
        "System Path": movie.path,
        "Size on Disk (GB)": size ? `${(size / 1000).toFixed(2)} GB` : 'No Size Recorded'
      }
    },
  ]
  if (!movie.MovieFiles) return meta

  let fileNumber = 1
  for (const file of movie.MovieFiles) {
    const fileProbeData = file.metadata
    for (const stream of fileProbeData.streams) {
      const data = {}
      for (const dataKey of Object.keys(stream)) {
        if (dataKey !== 'codec_long_name' && dataKey !== 'index' && typeof stream[dataKey] !== 'object') {
          data[dataKey] = stream[dataKey]
        }
      }
      if (stream.tags) {
        for (const dataKey of Object.keys(stream.tags)) {
          data[dataKey] = stream.tags[dataKey]
        }
      }
      meta.push({
        title: `${movie.MovieFiles.length > 1 ? `File ${fileNumber} - ` : ''}${stream.codec_long_name}`,
        data,
      })
    }
    fileNumber++
  }

  return meta
}

const Movie = () => {
  const { id } = useParams()
  const [movie, setMovie] = React.useState(null)
  const [fixMatchOpen, setFixMatchOpen] = React.useState(false)
  const [refreshingMetadata, setRefreshingMetadata] = React.useState(false)
  const [metadataOpen, setMetadataOpen] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)
  const [metaViewData, setMetaViewData] = React.useState(null)

  const history = useHistory()
  const theme = useTheme()

  React.useEffect(() => {
    async function fetch() {
      const resp = (await MovieService.getById(id)).data
      const size = (await MovieService.getSize(id)).data
      setMetaViewData(createMetadata(resp, size))
      setMovie(resp)
    }
    fetch()
  }, [id])

  const handleFixMatch = () => {
    setFixMatchOpen(true)
  }

  const handleFixMatchClose = (goback) => {
    if (goback) {
      return history.goBack()
    }
    return setFixMatchOpen(false)
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      await MovieService.syncMovie(movie.id)
      const movieResp = (await MovieService.getById(id)).data
      setMovie(movieResp)
    } catch (err) {
      console.error(err)
    }
    setSyncing(false)
  }

  const handleRefreshMetadata = async () => {
    try {
      setRefreshingMetadata(true)
      await MovieService.changeMetadata(movie.id, movie.Metadatum.tmdbId)
      const movieResp = (await MovieService.getById(id)).data
      setMovie(movieResp)
    } catch (err) {
      console.error(err)
    }
    setRefreshingMetadata(false)
  }

  if (!movie) return (
    <Grid sx={{ pt: 9 }} container>
      <Grid sx={{ height: '50vh ' }} container item justifyContent="center" alignItems="center">
        <Loading disableShrink size={100} />
      </Grid>
    </Grid>
  )

  if (!movie.Metadatum) {
    return <FixMatch
      open={true} close={handleFixMatchClose} setMatch={setMovie} current={movie} type="movie" />
  }
  const genres = movie ? movie.Metadatum.genres.split(',').filter((e) => e.toLowerCase() !== 'animation').join(', ') : ''
  const backdropImage = movie ? getImagePath(`/api/v1/image/${movie.Metadatum.local_backdrop_path}`) : ''

  const hidden = !canDisplayToUser()

  return (
    <Box sx={{ position: 'relative', flexGrow: 1, maxHeight: '100%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0 } }}>
      <MetadataModal title="Local System Metadata" open={metadataOpen} close={() => setMetadataOpen(false)} metadata={metaViewData} />
      <FixMatch open={fixMatchOpen} close={handleFixMatchClose} setMatch={setMovie} current={movie} type="movie" />
      <Box sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        // filter: 'blur(2px)',
        backgroundImage: `url("${backdropImage}")`, backgroundSize: 'cover', height: '365px',
        backgroundPosition: '50% 15%'
      }}>
      </Box>
      <Box sx={{ position: 'relative', zIndex: 2, pl: 3, pr: 3, pt: 3, flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid container item direction="column" alignItems="center" spacing={2} md={4}>
            <Grid item>
              <GeneralCoverCard cover={movie.Metadatum.local_poster_path} width={250} height={375} />
            </Grid>
            <Grid item>
              <Rating
                name="rating-read-only"
                value={movie.Metadatum.tmdb_rating / 2} precision={0.5} readOnly
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
                    <Button onClick={handleSync} variant="outlined" size="small"
                      disabled={syncing}
                      startIcon={syncing &&
                        <RefreshIcon sx={{
                          animation: 'spinright 1s infinite linear'
                        }} fontSize="inherit" />
                      }
                    >
                      Sync Movie
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
                <Typography sx={{ fontSize: 14, fontWeight: 'bold', color: 'primary.main' }} variant="subtitle2">Premiered {moment(movie.Metadatum.release_date).format('MMMM Do, YYYY')}</Typography>
              </Paper>
            </Grid>
          </Grid>
          <Grid container item direction="column" alignItems="space-evenly" spacing={2} md={8}>
            <Grid container justifyContent="flex-start" alignItems="center" sx={{ pl: 4, height: '365px', display: { xs: 'none', sm: 'none', md: 'inherit' } }}>
              {/* <Grid item>
                <Typography sx={{ position: 'relative', pt: 2, fontWeight: 900, fontSize: 60, WebkitTextStroke: '2px gray' }} variant="h1">
                  {movie.Metadatum.name}
                </Typography>
              </Grid> */}
            </Grid>
            <Grid item sx={{ display: { xs: 'none', sm: 'none', md: 'inherit' } }}>
              <Grid container justifyContent="flex-start">
                <Typography sx={{ position: 'relative', pt: 0, fontWeight: 900, fontSize: 36 }} variant="h1">
                  {movie.Metadatum.name}
                </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Box sx={{ width: '100%', pl: 0, pt: 0, pb: 2, pr: 1, height: 'auto', maxHeight: '285px' }}>
                <Grid container justifyContent="flex-start" alignItems="center">
                  <Typography sx={{ fontSize: 16, fontWeight: 'bold', color: 'secondary.main' }} variant="subtitle2">{genres}</Typography>
                </Grid>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="body1" sx={{ maxHeight: '200px', overflowY: 'auto', pr: 1 }}>
                  {movie.Metadatum.overview}
                </Typography>
              </Box>
            </Grid>
          </Grid>
            <Grid container item direction="row" sx={{ display: { md: movie.Metadatum.cast && movie.Metadatum.cast.length > 0 ? 12 : 'none' } }} justifyContent="center">
              <Box sx={{ display: 'flex', padding: 2, maxWidth: '80vw', overflowX: 'auto' }}>
                {
                  movie.Metadatum.cast && movie.Metadatum.cast.map((cast, i) => <CastCoverCard key={i} cast={cast} size={120} />)
                }
              </Box>
            </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default Movie