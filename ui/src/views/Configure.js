import React from 'react'
import { Grid } from '@material-ui/core'
import { AddLibrary, EditLibraries } from '../components'

const Configure = (props) => {
  const { libraries, setLibraries } = props
  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <EditLibraries libraries={libraries} setLibraries={setLibraries} />
        </Grid>
        <Grid item xs={12}>
          <AddLibrary setLibraries={setLibraries} />
        </Grid>
      </Grid>
    </> 
  )
}

export default Configure