import React from 'react';
import { Grid, Box, Typography, Paper, Button, Stack, Rating, Divider } from '@material-ui/core'
import moment from 'moment'
import { GeneralCoverCard } from '../components'
import { useParams } from 'react-router-dom'
import { MovieService } from '../services';

const Movie = () => {
  const { uuid } = useParams()
  const [movie, setMovie] = React.useState(null)

  React.useEffect(() => {
    async function fetch() {
      const resp = (await MovieService.getByUuid(uuid)).data
      console.log(resp)
      setMovie(resp)
    }
    fetch()
  }, [uuid])

  const backdropImage = movie ? `http://shaneisrael.net:1338/api/v1/image/${movie.Metadatum.local_backdrop_path}` : ''
  const genres = movie ? movie.Metadatum.genres.split(',').filter((e) => e.toLowerCase() !== 'animation').join(', ') : ''
  if (!movie) return <div>loading...</div>
  return  (
    <>
      <Box sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        filter: 'blur(3px)',
        backgroundImage: `url("${backdropImage}")`, backgroundSize: 'cover', width: '100%', height: '325px',
        backgroundPosition: '50% 15%'
      }}>
      </Box>
      <Box sx={{zIndex: 2, pl: 3, pr: 3, pt: 3, flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid container item direction="column" alignItems="center" spacing={2} md={4}>
            <Grid item>
              <GeneralCoverCard cover={movie.Metadatum.local_poster_path} width={250} height={375} />
            </Grid>
            <Grid item>
              <Rating
                name="rating-read-only"
                defaultValue={movie.Metadatum.tmdb_rating / 2} precision={0.5} readOnly
                size="large"
              />
            </Grid>
            <Grid item>
              <Box sx={{ width: '250px' }}>
                <Stack direction="column" spacing={1}>
                  <Button variant="outlined" size="small">
                    View Metadata
                  </Button>
                  <Button variant="outlined" size="small">
                    Refresh Metadata
                  </Button>
                  <Button variant="outlined" size="small">
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
            <Grid container justifyContent="center" alignItems="center" sx={{ pl: 4, height: '325px' }}>
              <Grid item>
                <Typography sx={{position: 'relative', pt: 2, fontWeight: 900, fontSize: 60, WebkitTextStroke: '2px gray' }} variant="h1">
                  {movie.Metadatum.name}
                </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Paper sx={{ width: '100%', pl: 2, pt: 2, pr: 1, height: '285px' }}>
                <Grid container justifyContent="flex-start" alignItems="center">
                  <Typography sx={{ fontSize: 16, fontWeight: 'bold', color: 'secondary.main' }} variant="subtitle2">{genres}</Typography>
                </Grid>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="body1" sx={{ maxHeight: '180px', overflowY: 'auto', pr: 1 }}>
                  {movie.Metadatum.overview}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default Movie