import React from 'react'
import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material'
import background from '../assets/blurred-background-01.png'

import { LoginForm } from '../components'

const Login = ({ setUser, forwardPage, prelabel }) => {
  return (
    <>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: -1,
        background: (theme) => theme.palette.mode === 'dark' ? `url("${background}") no-repeat center center fixed` : '',
        backgroundSize: '100% 100%', width: '100%', height: '100vh',
        filter: 'brightness(35%)',
        // filter: 'opacity(35%)'
      }} />
      <Grid container sx={{ height: '75vh' }} justifyContent="center" alignItems="center">
        <Grid item sx={{ maxWidth: 450 }}>
          <LoginForm setUser={setUser} forwardPage={forwardPage} prelabel={prelabel} />
        </Grid>
      </Grid>
    </>
  )
}

export default Login