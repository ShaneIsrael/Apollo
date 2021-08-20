import React from 'react';
import { Grid, Box, Typography, Paper, Button, Stack, Rating, Divider } from '@material-ui/core'
import moment from 'moment'
import { SeasonCoverCard, GeneralCoverCard, Loading } from '../components'
import { useHistory, useParams } from 'react-router-dom'
import { SeriesService } from '../services'
import FixMatch from '../components/widgets/FixMatch';
import { getImagePath } from '../components/utils';
import background from '../assets/blurred-background-01.png'
// blurred-texture-background02

const Series = () => {
  const { id } = useParams()
  const [series, setSeries] = React.useState(null)
  const [fixMatchOpen, setFixMatchOpen] = React.useState(false)
  const history = useHistory()

  React.useEffect(() => {
    async function fetch() {
      const resp = (await SeriesService.getById(id)).data
      setSeries(resp)
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
    <>
      <FixMatch open={fixMatchOpen} close={handleFixMatchClose} setMatch={setSeries} current={series} type="series" />
      <Box sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        // filter: 'blur(0px) brightness(100%)',
        backgroundImage: `url("${backdropImage}")`, backgroundSize: 'cover', width: '100%', height: '365px',
        backgroundPosition: '50% 15%'
      }}>
      </Box>
      <Box sx={{
        position: 'absolute',
        top: 405,
        left: 0,
        right: 0,
        background: (theme) => theme.palette.mode === 'dark' ? `url("${background}") no-repeat center center fixed` : '',
        backgroundSize: '100% 100%', width: '100%', height: '100vh',
        filter: 'brightness(35%)',
        // filter: 'opacity(35%)'
      }} />
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
            <Grid item>
              <Box sx={{ width: '250px' }}>
                <Stack direction="column" spacing={1}>
                  <Button variant="outlined" size="small">
                    View Metadata
                  </Button>
                  <Button variant="outlined" size="small">
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
                <Typography sx={{ fontSize: 14, fontWeight: 'bold', color: 'primary.main' }} variant="subtitle2">Premiered {moment(series.Metadatum.release_date).format('MMMM Do, YYYY')}</Typography>
              </Paper>
            </Grid>
          </Grid>
          <Grid container item direction="column" alignItems="space-evenly" spacing={2} md={8}>
            <Grid container justifyContent="flex-start" alignItems="center" sx={{ pl: 4, height: '360px', display: { xs: 'none', sm: 'none', md: 'inherit' } }}>
              {/* <Grid item>
                <Typography sx={{ position: 'relative', pt: 2, fontWeight: 900, fontSize: 60, WebkitTextStroke: '2px gray', color: 'white' }} variant="h1">
                  {series.Metadatum.name}
                </Typography>
              </Grid> */}
            </Grid>
            <Grid item sx={{ display: { xs: 'none', sm: 'none', md: 'inherit' } }}>
              <Grid container justifyContent="flex-start">
                <Typography sx={{ position: 'relative', pt: 0, fontWeight: 900, fontSize: 36}} variant="h1">
                  {series.Metadatum.name}
                </Typography>
              </Grid>
            </Grid>
            <Grid item>
              <Box sx={{ width: '100%', pl: 0, pt: 0, pb: 2, pr: 1, height: 'auto', maxHeight: '285px', overflowY: 'auto' }}>
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
          <Grid container item direction="column" sx={{ display: { md: series.Seasons.length > 0 ? 12 : 'none' } }} alignItems="center">
            <Box sx={{ maxHeight: '520px', padding: 2, overflowY: 'auto' }}>
              <Grid container spacing={2} justifyContent="center">
                {
                  series.Seasons.map((season, i) => <Grid item key={i}><SeasonCoverCard seriesId={id} season={season.season} cover={season.local_poster_path || series.Metadatum.local_poster_path} width={140} height={210} /></Grid>)
                }
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default Series