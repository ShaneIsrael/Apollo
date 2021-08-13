import { Divider, Paper, TextField, Typography, Box, Button, FormControlLabel, Checkbox, Alert } from '@material-ui/core';
import React from 'react';
import AuthService from '../../services/AuthService';

const AdminSetup = () => {

  const [username, setUsername] = React.useState(null)
  const [password, setPassword] = React.useState(null)
  const [confirmPassword, setConfirmPassword] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [info, setInfo] = React.useState(null)

  const handleRegister = async () => {
    try {
      if (username && password && confirmPassword) {
        if (password !== confirmPassword) {
          return setError('Passwords do not match!')
        }
        await AuthService.register(username, password)
        setInfo('Admin account created')
        setError(null)
      }
      //TODO save the enable admin and restrict access setting
    } catch (error) {
      if (error.response) {
        setInfo(null)
        setError(error.response.data)
      } else {
        console.error(error)
      }
    }
  }

  return (
    <Paper sx={{flexGrow: 1, p: 2, width: 300}}>
      <Typography variant="h5">Admin Setup</Typography>
      {/* <Divider/> */}
      <Box sx={{display: 'flex', flexDirection: 'column', p: 1, pt: 2}}>
        {error && <Alert variant="filled" sx={{mb: 2}} severity="error">{error}</Alert>}
        {info && <Alert variant="filled" sx={{mb: 2}} severity="success">{info}</Alert>}
        <TextField onChange={(e) => setUsername(e.target.value)} sx={{pb: 2}} required label="Username"/>
        <TextField onChange={(e) => setPassword(e.target.value)} sx={{pb: 2}} required label="Password" type="password"/>
        <TextField onChange={(e) => setConfirmPassword(e.target.value)} sx={{pb: 2}} required label="Confirm Password" type="password"/>
        <FormControlLabel sx={{}} control={<Checkbox />} label="Enable Admin" />
        <FormControlLabel sx={{pb: 2}} control={<Checkbox />} label="Restrict Access" />
        <Button onClick={handleRegister} variant="outlined" size="large">Save</Button>
      </Box>
    </Paper>
  )
}

export default AdminSetup