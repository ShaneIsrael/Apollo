import React from 'react'
import moment from 'moment'
import { Grid, Box, Typography, Paper, Button, Stack, Rating, Divider, setRef } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import WarningIcon from '@mui/icons-material/Warning'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useParams } from 'react-router-dom'
import { SeriesService } from '../services'

import { GeneralCoverCard, Loading, MetadataModal } from '../components'
import background from '../assets/blurred-background-01.png'
import still_not_found from '../assets/still_not_found.png'
import { canDisplayToUser } from '../components/utils'


function createEpisodeCard(episode, setSelectedEpisode) {
  return (
    <>
      {/* <Grid container item spacing={2}> */}
        <Grid item>
          <div onClick={() => setSelectedEpisode(episode)}>
            <GeneralCoverCard cover={episode.local_still_path} alt={still_not_found} width={200} height={112} />
          </div>
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
      {/* </Grid> */}
    </>
  )
}

function createEpisodeMetadata(episode) {
  // const fileProbeData = episode.file_probe_data
  const meta = [{
    title: 'General Info',
    data: {
      "TMDb ID": episode.tmdbId,
      "Filename": episode.filename,
      "Local Path": episode.path,
      "Last Updated": moment(episode.updatedAt).format('MMMM Do, YYYY - hh:mm:ss A ')
    }
  }]
  // for (const stream of fileProbeData.streams) {
  //   const data = {}
  //   let title
  //   for (const dataKey of Object.keys(stream)) {
  //     if (dataKey !== 'codec_long_name' && dataKey !== 'index' && typeof stream[dataKey] !== 'object') {
  //       data[dataKey] = stream[dataKey]
  //     }
  //   }
  //   if (stream.tags) {
  //     for (const dataKey of Object.keys(stream.tags)) {
  //       if (dataKey === 'title') {
  //         title = stream.tags[dataKey]
  //         continue
  //       }
  //       data[dataKey] = stream.tags[dataKey]
  //     }
  //   }
  //   meta.push({
  //     title: title ? title : stream.codec_long_name,
  //     data,
  //   })
  // }

  return meta
}

const Season = () => {
  const { id, season } = useParams()
  const [seasonData, setSeasonData] = React.useState(null)
  const [series, setSeries] = React.useState(null)
  const [rating, setRating] = React.useState(null)
  const [refreshingEpisodes, setRefreshingEpisodes] = React.useState(false)
  const [probingEpisodes, setProbingEpisodes] = React.useState(false)
  const [metadataOpen, setMetadataOpen] = React.useState(false)
  const [selectedEpisode, setSelectedEpisode] = React.useState(null)

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
      setSeries(seriesResp)
    } catch (err) {
      console.error(err)
    }
  }
  React.useEffect(() => {
    fetch()
  }, [id, season])

  const handleRefreshEpisodeMetadata = async () => {
    try {
      setRefreshingEpisodes(true)
      await SeriesService.refreshSeasonEpisodesMetadata(seasonData.id)
      fetch()
    } catch (err) {
      console.error(err)
    }
    setRefreshingEpisodes(false)
  }
  const handleProbeEpisodes = async () => {
    try {
      setProbingEpisodes(true)
      await SeriesService.probeSeasonEpisodes(seasonData.id)
      fetch()
    } catch (err) {
      console.error(err)
    }
    setProbingEpisodes(false)
  }

  if (!seasonData) return (
    <Grid sx={{ pt: 9 }} container>
      <Grid sx={{ height: '50vh ' }} container item justifyContent="center" alignItems="center">
        <Loading disableShrink size={100} />
      </Grid>
    </Grid>
  )

  const hidden = !canDisplayToUser()
  let metaViewData 
  if (seasonData) {
    metaViewData = [
      {
        title: "General Info",
        data: {
        "TMDb ID": seasonData.tmdbId,
        "System Path": seasonData.path,
        "Number of Episodes": seasonData.Episodes.length,
        "Size (GB)": "TODO",
        }
      },
    ]
  }

  return (
    <Box sx={{ position: 'relative', flexGrow: 1, maxHeight: '100%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0 }  }}>
      <MetadataModal title="Local System Metadata"  open={metadataOpen} close={() => setMetadataOpen(false)} metadata={metaViewData} />
      { selectedEpisode && <MetadataModal title={`Episode ${selectedEpisode.episode_number} File Data`} open={selectedEpisode ? true : false} close={() => setSelectedEpisode(null)} metadata={createEpisodeMetadata(selectedEpisode)} />}
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
            {!hidden &&
              <Grid item>
                <Box sx={{ width: '250px' }}>
                  <Stack direction="column" spacing={1}>
                    <Button onClick={() => setMetadataOpen(true)} variant="outlined" size="small">
                      View Season Metadata
                    </Button>
                    <Button variant="outlined" size="small"
                      onClick={handleRefreshEpisodeMetadata}
                      disabled={refreshingEpisodes}
                      startIcon={refreshingEpisodes &&
                        <RefreshIcon sx={{
                          animation: 'spinright 1s infinite linear'
                        }} fontSize="inherit" />
                      }>
                      Refresh Episode Metadata
                    </Button>
                    <Button variant="outlined" size="small"
                      onClick={handleProbeEpisodes}
                      disabled={probingEpisodes}
                      startIcon={probingEpisodes &&
                        <RefreshIcon sx={{
                          animation: 'spinright 1s infinite linear'
                        }} fontSize="inherit" />
                      }
                    >
                      Probe Episode Files
                    </Button>
                  </Stack>
                </Box>
              </Grid>
            }
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
          <Grid container item alignItems="flex-start" spacing={2} md={8} sx={{ maxHeight: '95vh', padding: 2, overflowY: 'auto' }}>
            <Grid container item spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">Episodes</Typography>
                <Divider />
              </Grid>
            </Grid>
            {seasonData.Episodes.map((episode, i) => <Grid key={i} container item spacing={2} xs={12}>{createEpisodeCard(episode, setSelectedEpisode)}</Grid>)}
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default Season