import React from 'react'
import { Grid, Typography, Box, Divider } from '@material-ui/core'
import tmdb_logo from '../assets/tmdb_logo.svg'
import logo_dark from '../assets/logo_vertical_dark.png'
import logo_light from '../assets/logo_vertical_light.png'
const About = ({ theme }) => {
  return (
    <>
      <Grid container sx={{ p: 4, width: '100%' }} justifyContent="center" spacing={2}>
        <Grid container item xs={12} justifyContent="center">
          <Grid container item justifyContent="center" xs={12}>
            <img src={theme === 'dark' ? logo_light : logo_dark} height={275} />
          </Grid>
          {/* <Typography variant="h2">
            Apollo
          </Typography> */}
        </Grid>
        <Grid container item xs={12} justifyContent="center" >
          <Typography variant="body1" sx={{ mb: 2 }}>
            <Divider sx={{ mb: 2 }} />
            Apollo is a media browser for your HTPC media libraries. Apollo provides a clean interface for
            you and others to easily view series, movie, and file specific metadata related to your collection.
          </Typography>
          <Typography variant="body1">
            Apollo automatically picks up changes to your media libraries and updates itself accordingly.
            Interesting statistics related to your media libraries will also be generated and updated frequently.
            <Divider sx={{ mt: 2 }} />
          </Typography>
        </Grid>
      </Grid>
      <Grid container sx={{ width: '100%' }}>
        <Grid container item xs={12} justifyContent="center">
          <Typography variant="body1" sx={{ fontWeight: 'lighter', fontSize: 32 }} color="primary">
            CREDITS
          </Typography>
        </Grid>
        <Grid container item xs={12} justifyContent="center" >
          <Typography variant="subtitle2" sx={{ mb: 2, pl: 2, pr: 2 }}>
            <Divider sx={{ mb: 2, }} />
            This product uses the TMDb API but is not endorsed or certified by TMDb.
          </Typography>
        </Grid>
        <Grid container item xs={12} justifyContent="center">
          <img src={tmdb_logo} height={15} />
        </Grid>
      </Grid>
    </>
  )
}

export default About