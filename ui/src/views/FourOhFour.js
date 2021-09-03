import React from 'react'
import { Grid, Alert, AlertTitle } from '@mui/material'

const FourOhFour = (props) => {

  return (
    <Grid container sx={{p: 5, width: '100%'}}>
      <Grid container item justifyContent="center" alignItems="center">
        <Alert variant="filled" severity="warning">
          <AlertTitle>Page Not Found</AlertTitle>
          Well this is umm.. Awkward...
        </Alert>
      </Grid>
    </Grid>
  )
}

export default FourOhFour