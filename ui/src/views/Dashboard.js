import { Alert, AlertTitle, Box, Grid } from '@material-ui/core'
import React, { useState } from 'react'
import { GeneralStatsTable, ScatterPoint } from '../components'
import { LibraryService, StatsService } from '../services'

const Dashboard = (props) => {
  const { libraries } = props
  const [releaseYears, setReleaseYears] = useState([])

  React.useEffect(() => {
    async function fetch() {
      StatsService.getMediaReleaseYears().then(resp => setReleaseYears(resp.data))
        .catch(err => console.error(err))
    }
    fetch()
    return () => LibraryService.cancel()
  }, [setReleaseYears])

  return (
    <Box sx={{ pt: 3, pl: 3, pr: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {libraries.length > 0 ?
            libraries.map(l => <GeneralStatsTable key={l.id} library={l} />)
            : <div></div>
          }
        </Grid>
        <Grid item xs={12}>
          {
            releaseYears ?
              <ScatterPoint name="Series" name2="Movies" title="Media Release Years" data={releaseYears} valueInterval={5} argumentInterval={5} />
              :
              <Alert sx={{ width: '100%' }} variant="filled" severity="info">
                <AlertTitle>No Release Years Stats</AlertTitle>
                Release year stats have not yet been generated.
              </Alert>
          }
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard