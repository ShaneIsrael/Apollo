import { Box, Grid } from '@material-ui/core'
import React, { useState } from 'react'
import { GeneralStatsTable } from '../components'
import { LibraryService } from '../services'

const Dashboard = () => {
  const [libraries, setLibraries] = useState([])

  React.useEffect(() => {
    async function fetch() {
      try {
        const resp = (await LibraryService.getLibraries()).data
        setLibraries(resp)
      } catch (err) {
        console.error(err)
      }
    }
    fetch()
  }, [setLibraries])

  return (
    <Box sx={{pt: 3, pl: 3, pr: 3}}>
      <Grid container>
        <Grid item xs={12}>
          {
            libraries.map(l => <GeneralStatsTable key={l.id} library={l}/>)
          }
        </Grid>
      </Grid>
    </Box> 
  )
}

export default Dashboard