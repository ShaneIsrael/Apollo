import React from 'react'
import { Box, Button, Grid, Paper, TextField, Typography } from '@material-ui/core'


import { LoginForm } from '../components'

const Login = ({setUser, forwardPage, prelabel}) => {
  return (
    <Grid container sx={{height: '75vh'}} justifyContent="center" alignItems="center">
      <Grid item sx={{maxWidth: 450}}>
        <LoginForm setUser={setUser} forwardPage={forwardPage} prelabel={prelabel} />
      </Grid>
    </Grid>
  )
}

export default Login