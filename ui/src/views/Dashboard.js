import { Alert, AlertTitle, Box, Grid } from '@mui/material'
import React, { useState } from 'react'
import { GeneralStatsTable, ScatterPoint, MediaYearsStats, LibrarySizeStats } from '../components'
import { LibraryService, StatsService } from '../services'

const Dashboard = (props) => {
  const { libraries } = props
  const [releaseYears, setReleaseYears] = useState([])
  const [librarySizes, setLibrarySizes] = useState([])

  // store in different variable so that when we
  // sort them the oder in the sidebar doesn't change
  const statLibraries = [...libraries]

  React.useEffect(() => {
    async function fetch() {
      StatsService.getMediaReleaseYears().then(resp => setReleaseYears(resp.data))
        .catch(err => console.error(err))
      StatsService.getLibrarySizes().then(resp => setLibrarySizes(resp.data))
        .catch(err => console.error(err))
    }
    fetch()
    return () => LibraryService.cancel()
  }, [setReleaseYears])

  return (
    <Box sx={{ pt: 3, pl: 3, pr: 3, maxHeight: '100%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0 } }}>
      <Grid container direction="row" spacing={1}>
        {statLibraries.length > 0 ?
          statLibraries.sort((a, b) => a.type === 'movie').map(l => <Grid key={l.id} item xs={12} md={6} lg={6}><GeneralStatsTable library={l} /></Grid>)
          : <div></div>
        }
        <Grid item xs={12}>
          {
            releaseYears ?
              <MediaYearsStats data={releaseYears} />
              :
              <Alert sx={{ width: '100%' }} variant="filled" severity="info">
                <AlertTitle>No Release Years Stats</AlertTitle>
                Release year stats have not yet been generated.
              </Alert>
          }
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          {
            librarySizes ?
              <LibrarySizeStats data={librarySizes} type="series" slice={10} />
              :
              <Alert sx={{ width: '100%' }} variant="filled" severity="info">
                <AlertTitle>No Library Size Stats</AlertTitle>
                Library size stats have not yet been generated.
              </Alert>
          }
        </Grid>
        <Grid item xs={12} md={12}>
          {
            librarySizes ?
              <LibrarySizeStats data={librarySizes} type="movie" slice={10} />
              :
              <Alert sx={{ width: '100%' }} variant="filled" severity="info">
                <AlertTitle>No Library Size Stats</AlertTitle>
                Library size stats have not yet been generated.
              </Alert>
          }
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard