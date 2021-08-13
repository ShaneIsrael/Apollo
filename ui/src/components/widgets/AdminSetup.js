import { Divider, Paper, TextField, Typography, Box, Button, FormControlLabel, Checkbox, Alert } from '@material-ui/core';
import React from 'react';
import { ConfigService } from '../../services';
import AuthService from '../../services/AuthService';
import { getLocalConfig, setLocalConfig } from '../utils';

const AdminSetup = () => {

  const [username, setUsername] = React.useState(null)
  const [password, setPassword] = React.useState(null)
  const [confirmPassword, setConfirmPassword] = React.useState(null)

  const [enableAdmin, setEnableAdmin] = React.useState(getLocalConfig().enableAdmin || false)
  const [restrictAccess, setRestrictAccess] = React.useState(getLocalConfig().restrictAccess || false)

  const [error, setError] = React.useState(null)
  const [info, setInfo] = React.useState(null)

  const handleRegister = async () => {
    try {
      if (username && password && confirmPassword) {
        if (password !== confirmPassword) {
          return setError('Passwords do not match!')
        }
        await AuthService.register(username, password)
        setInfo('Admin Created')
        setError(null)
      }
    } catch (error) {
      if (error.response) {
        setInfo(null)
        setError(error.response.data)
      } else {
        console.error(error)
      }
    }
  }

  const handleSaveSettings = async () => {
    try {
      const config = (await ConfigService.saveConfig(getLocalConfig().id, {
        enableAdmin,
        restrictAccess
      })).data
      setInfo('Settings Saved!')
      setError(null)
      setLocalConfig(config)
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
    <Box sx={{flexGrow: 1, p: 2, width: 320}}>
      <Box sx={{display: 'flex', flexDirection: 'column', p: 1, pt: 2}}>
        {error && <Alert variant="filled" sx={{mb: 2}} severity="error">{error}</Alert>}
        {info && <Alert variant="filled" sx={{mb: 2}} severity="success">{info}</Alert>}
        <TextField onChange={(e) => setUsername(e.target.value)} sx={{pb: 2}} required label="Admin Username"/>
        <TextField onChange={(e) => setPassword(e.target.value)} sx={{pb: 2}} required label="Admin Password" type="password"/>
        <TextField onChange={(e) => setConfirmPassword(e.target.value)} sx={{pb: 2}} required label="Confirm Password" type="password"/>
        <Button onClick={handleRegister} disabled={!(username && password && confirmPassword)} variant="outlined" size="large">Set Admin</Button>
        <Divider sx={{mt: 2}}/>
        <FormControlLabel sx={{}} control={<Checkbox checked={enableAdmin} onChange={(e) => setEnableAdmin(e.target.checked)} />} label="Enable Admin" />
        <FormControlLabel sx={{pb: 2}} control={<Checkbox checked={restrictAccess} onChange={(e) => setRestrictAccess(e.target.checked)} />} label="Restrict Access" />
        <Button onClick={handleSaveSettings} variant="outlined" size="large">Save Settings</Button>
      </Box>
    </Box>
  )
}

export default AdminSetup