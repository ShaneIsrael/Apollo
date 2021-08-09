import { Box, Grid } from '@material-ui/core'
import React, { useState } from 'react'
import { GeneralStatsTable, ScatterPoint } from '../components'
import { LibraryService, StatsService } from '../services'

const Dashboard = (props) => {
  const { libraries } = props
  const [releaseYears, setReleaseYears] = useState([])

  React.useEffect(() => {
    async function fetch() {
      // LibraryService.getLibraries().then(resp => setLibraries(resp.data))
      //   .catch(err => console.error(err))
      StatsService.getMediaReleaseYears().then(resp => setReleaseYears(resp.data))
        .catch(err => console.error(err))
      // try {
      //   const resp = (await LibraryService.getLibraries()).data
      //   const resp2 = (await StatsService.getMediaReleaseYears()).data
      //   setLibraries(resp)
      //   setReleaseYears(resp2)
      // } catch (err) {
      //   console.error(err)
      // }
    }
    fetch()
    return () => LibraryService.cancel()
  }, [setReleaseYears])

  return (
    <Box sx={{pt: 3, pl: 3, pr: 3}}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {libraries.length > 0 ? 
            libraries.map(l => <GeneralStatsTable key={l.id} library={l}/>)
            : <div></div>
          }
        </Grid>
        <Grid item xs={12}>
          <ScatterPoint  name="Series" name2="Movies" title="Media Release Years" data={releaseYears} valueInterval={5} argumentInterval={5}/>
        </Grid>
      </Grid>
    </Box> 
  )
}

export default Dashboard