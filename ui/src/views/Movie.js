import React from 'react';
import { useHistory, useParams } from 'react-router-dom'
import moment from 'moment'
import { Grid, Box, Typography, Paper, Button, Stack, Rating, Divider } from '@material-ui/core'
import RefreshIcon from '@material-ui/icons/Refresh'
import { GeneralCoverCard, Loading } from '../components'
import { MovieService } from '../services';
import FixMatch from '../components/widgets/FixMatch';
import { getImagePath } from '../components/utils';
import background from '../assets/blurred-background-01.png'

const Movie = () => {
  const { id } = useParams()
  const [movie, setMovie] = React.useState(null)
  const [fixMatchOpen, setFixMatchOpen] = React.useState(false)
  const [refreshingMetadata, setRefreshingMetadata] = React.useState(false)

  const history = useHistory()

  React.useEffect(() => {
    async function fetch() {
      const resp = (await MovieService.getById(id)).data
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

  const handleRefreshMetadata = async () => {
    try {
      setRefreshingMetadata(true)
      await MovieService.changeMetadata(movie.id, movie.Metadatum.tmdbId)
      const movieResp = (await Movie.getById(id)).data
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
  return (
    <>
      <FixMatch open={fixMatchOpen} close={handleFixMatchClose} setMatch={setMovie} current={movie} type="movie" />
      <Box sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        // filter: 'blur(2px)',
        backgroundImage: `url("${backdropImage}")`, backgroundSize: 'cover', width: '100%', height: '365px',
        backgroundPosition: '50% 15%'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 365,
          left: 0,
          right: 0,
          backgroundImage: (theme) => theme.palette.mode === 'dark' ? `url("${background}")` : '', 
          backgroundSize: 'cover', width: '100%', height: '100vh',
          filter: 'brightness(35%)',
        }} />
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
            <Grid item>
              <Box sx={{ width: '250px' }}>
                <Stack direction="column" spacing={1}>
                  <Button variant="outlined" size="small">
                    View Metadata
                  </Button>
                  <Button onClick={handleRefreshMetadata} variant="outlined" size="small" disabled={refreshingMetadata} 
                      startIcon={ refreshingMetadata &&
                      <RefreshIcon sx={{
                        animation: 'spinright 1s infinite linear'
                      }} fontSize="inherit" />
                    }>
                    Refresh Metadata
                  </Button>
                  <Button onClick={handleFixMatch} variant="outlined" size="small">
                    Fix Match
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item>
              <Paper sx={{ width: '250px', pl: 2, pr: 2, pt: 1, pb: 1 }}>
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
        </Grid>
      </Box>
    </>
  )
}

export default Movie