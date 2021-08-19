import React from 'react';
import { Grid, Box, Typography, Paper, Button, Stack, Rating, Divider } from '@material-ui/core'
import { useParams } from 'react-router-dom'
import { SeriesService } from '../services'

import background from '../assets/blurred-background-01.png'
import { GeneralCoverCard, Loading } from '../components';

function createEpisodeCard(episode) {
  return (
    <>
      <Grid container item spacing={2}>
        <Grid item>
          <GeneralCoverCard cover={episode.local_still_path} width={200} height={112} />
        </Grid>
        <Grid item md={7} sx={{ mt: -0.5 }} >
          <Grid item xs={12}>
            <Typography variant="caption" color="secondary">{`Episode ${episode.episode_number}`}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold'}}>{episode.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{overflow: 'auto', maxHeight: '150px', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0}}}>{episode.overview}</Typography>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

const Season = () => {
  const { uuid, season } = useParams()
  const [seasonData, setSeasonData] = React.useState(null)

  React.useEffect(() => {
    async function fetch() {
      const resp = (await SeriesService.getSeasonAndEpisodes(uuid, season)).data
      setSeasonData(resp)
    }
    fetch()
  }, [uuid, season])

  if (!seasonData) return (
    <Grid sx={{ pt: 9 }} container>
      <Grid sx={{ height: '50vh ' }} container item justifyContent="center" alignItems="center">
        <Loading disableShrink size={100} />
      </Grid>
    </Grid>
  )

  return (
    <>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundImage: (theme) => theme.palette.mode === 'dark' ? `url("${background}")` : '',
        backgroundSize: 'cover', width: '100%', height: '100vh',
        filter: 'brightness(35%)',
        // filter: 'opacity(35%)'
      }} />
      <Box sx={{ position: 'relative', pl: 3, pr: 0, pt: 5, flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid container item direction="column" alignItems="center" spacing={2} md={5} sx={{pb: 3}}>
            <Grid item>
              <GeneralCoverCard cover={seasonData.local_poster_path} width={300} />
            </Grid>
            <Grid item>
              <Typography variant="h4">{seasonData.season === 0 ? 'Specials' : `Season ${seasonData.season}`}</Typography>
            </Grid>
          </Grid>
          <Grid container item spacing={2} md={7} sx={{ maxHeight: '95vh', padding: 2, overflowY: 'auto' }}>
              {seasonData.Episodes.map((episode, i) => <Grid key={i} item xs={12}>{createEpisodeCard(episode)}</Grid>)}
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default Season