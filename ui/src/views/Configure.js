import React from 'react'
import { Grid, Box } from '@material-ui/core'
import { AddLibrary, EditLibraries, LiveServerLogs } from '../components'
import { LibraryService } from "../services"

const Configure = (props) => {
  const { libraries, setLibraries } = props

  return (
    <Box sx={{pl: 3, pr: 3, pt: 4}}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <EditLibraries libraries={libraries} setLibraries={setLibraries} />
        </Grid>
        <Grid item xs={12}>
          <AddLibrary setLibraries={setLibraries} />
        </Grid>
        <Grid item xs={12}>
          <LiveServerLogs />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Configure