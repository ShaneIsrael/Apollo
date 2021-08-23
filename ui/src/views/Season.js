import React from 'react'
import moment from 'moment'
import { Grid, Box, Typography, Paper, Button, Stack, Rating, Divider } from '@material-ui/core'
import StarIcon from '@material-ui/icons/Star'
import WarningIcon from '@material-ui/icons/Warning';
import { useParams } from 'react-router-dom'
import { SeriesService } from '../services'

import { GeneralCoverCard, Loading } from '../components'
import background from '../assets/blurred-background-01.png'
import still_not_found from '../assets/still_not_found.png'


function createEpisodeCard(episode) {
  return (
    <>
      <Grid container item spacing={2}>
        <Grid item>
          <GeneralCoverCard cover={episode.local_still_path} alt={still_not_found} width={200} height={112} />
          <Grid container justifyContent="center">
            <Rating
              name="episode-rating-read-only"
              value={episode.tmdb_rating / 2} precision={0.5} readOnly
              size="small"
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
          </Grid>
        </Grid>
        <Grid item md={7}>
          <Grid sx={{ m: 0 }} item xs={12}>
            <Typography sx={{ display: 'inline-block', fontWeight: 'bold', lineHeight: 1 }} variant="subtitle1" color="primary">
              {`${episode.episode_number < 10 ? '0' + episode.episode_number : episode.episode_number} — ${episode.tmdbId ? episode.name : 'No TMDb Episode Data'}`}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="gray">{`${episode.tmdbId ? moment(episode.air_date).format('MMMM Do, YYYY') : 'No TMDb Episode Data'}`}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ overflow: 'auto', maxHeight: '150px', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0 } }}>
              {episode.tmdbId ? episode.overview : `The file exists on disk, but we could not locate any TMDb data for this episode.`}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

const Season = () => {
  const { id, season } = useParams()
  const [seasonData, setSeasonData] = React.useState(null)
  const [series, setSeries] = React.useState(null)
  const [rating, setRating] = React.useState(null)

  React.useEffect(() => {
    async function fetch() {
      try {
        const seasonResp = (await SeriesService.getSeasonAndEpisodes(id, season)).data
        const seriesResp = (await SeriesService.getById(id)).data
        if (seasonResp.Episodes) {
          const qualifyingEpisodes = seasonResp.Episodes.filter((episode) => episode.tmdb_rating > 0)
          const episodeRatings = qualifyingEpisodes.map(episode => episode.tmdb_rating)
          if (episodeRatings.length > 0) {
            setRating((episodeRatings.reduce((a, c) => a + c) / episodeRatings.length).toFixed(2))
          }
          seasonResp.Episodes.sort((a, b) => Number(a.episode_number) - Number(b.episode_number))
        }
        setSeasonData(seasonResp)
        console.log(seasonResp)
        setSeries(seriesResp)
      } catch (err) {
        console.error(err)
      }
    }
    fetch()
  }, [id, season])

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
        background: (theme) => theme.palette.mode === 'dark' ? `url("${background}") no-repeat center center fixed` : '',
        backgroundSize: '100% 100%', width: '100%', height: '100vh',
        filter: 'brightness(35%)',
        // filter: 'opacity(35%)'
      }} />
      <Box sx={{ position: 'relative', pl: 3, pr: 0, pt: 5, flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid container item direction="column" alignItems="center" spacing={2} md={4} sx={{ pb: 3 }}>
            <Grid item>
              <GeneralCoverCard cover={seasonData.local_poster_path} width={250} />
            </Grid>
            <Grid item>
              <Typography align="center" variant="h6">{series && series.Metadatum.name}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h5">{seasonData.season === 0 ? 'Specials' : `Season ${seasonData.season}`}</Typography>
            </Grid>
            <Grid item>
              <Rating
                name="season-rating-read-only"
                value={rating / 2} precision={0.5} readOnly
                size="medium"
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
            </Grid>
            <Grid item>
              <Box sx={{ width: '250px' }}>
                <Stack direction="column" spacing={1}>
                  <Button variant="outlined" size="small">
                    View Season Metadata
                  </Button>
                  <Button variant="outlined" size="small">
                    Refresh Episode Metadata
                  </Button>
                  <Button variant="outlined" size="small">
                    Probe Episode Files
                  </Button>
                </Stack>
              </Box>
            </Grid>
            {!seasonData.tmdbId &&
              <Grid item>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" align="center" color="yellow">
                  <WarningIcon sx={{ fontSize: 36 }} />
                </Typography>
                <Typography sx={{ display: 'block' }} fontSize={14} fontWeight="bold" align="center" color="secondary" variant="overline">
                  No TMDb Season data found
                </Typography>
                <Typography sx={{ display: 'block' }} fontWeight="bold" align="center" color="secondary" variant="overline">
                  {`Last checked: ${moment(seasonData.updatedAt).format('MMMM Do, YYYY')}`}
                </Typography>
                <Typography sx={{ display: 'block' }} align="center" variant="subtitle2">
                  You can try refreshing the season metadata or consider updating this seasons metadata on TMDb yourself.
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </Grid>
            }
          </Grid>
          <Grid container item spacing={2} md={8} sx={{ maxHeight: '95vh', padding: 2, overflowY: 'auto' }}>
            <Grid container item spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">Episodes</Typography>
                <Divider />
              </Grid>
            </Grid>
            {seasonData.Episodes.map((episode, i) => <Grid key={i} item xs={12}>{createEpisodeCard(episode)}</Grid>)}
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default Season