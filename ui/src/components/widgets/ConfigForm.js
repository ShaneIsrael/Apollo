import { Divider, Paper, TextField, Typography, Box, Button, FormControlLabel, Checkbox, Alert, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import React from 'react';
import { ConfigService } from '../../services';
import AuthService from '../../services/AuthService';
import { getLocalConfig, setLocalConfig } from '../utils';

const ConfigForm = () => {

  const [username, setUsername] = React.useState(null)
  const [password, setPassword] = React.useState(null)
  const [confirmPassword, setConfirmPassword] = React.useState(null)

  const [role, setRole] = React.useState('admin')

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
        await AuthService.register(username, password, role)
        setInfo('Account Created')
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
    <Box sx={{flexGrow: 1, p: 2, width: '100%'}}>
      <Box sx={{display: 'flex', flexDirection: 'column', p: 1, pt: 2}}>
        {error && <Alert variant="filled" sx={{mb: 2}} severity="error">{error}</Alert>}
        {info && <Alert variant="filled" sx={{mb: 2}} severity="success">{info}</Alert>}
        <FormControl required sx={{ width: '100%', pb: 1 }}>
          <InputLabel id="edit-account-type-label">Account Type</InputLabel>
          <Select
            labelId="edit-account-type-label"
            id={"edit-account-type-id"}
            value={role}
            label="Account Type"
            size="medium"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value={'user'}>User</MenuItem>
            <MenuItem value={'admin'}>Admin</MenuItem>
          </Select>
        </FormControl>
        <TextField onChange={(e) => setUsername(e.target.value)} sx={{pb: 2}} size="medium" required label="Account Username"/>
        <TextField onChange={(e) => setPassword(e.target.value)} sx={{pb: 2}} size="medium" required label="Account Password" type="password"/>
        <TextField onChange={(e) => setConfirmPassword(e.target.value)} sx={{pb: 2}} size="medium" required label="Confirm Password" type="password"/>
        <Button onClick={handleRegister} disabled={!(username && password && confirmPassword)} variant="outlined" size="large">Create Account</Button>
        <Divider sx={{mt: 2}}/>
        <FormControlLabel sx={{}} control={<Checkbox checked={enableAdmin} onChange={(e) => setEnableAdmin(e.target.checked)} />} label="Enable Admin" />
        <FormControlLabel sx={{pb: 2}} control={<Checkbox checked={restrictAccess} onChange={(e) => setRestrictAccess(e.target.checked)} />} label="Restrict Access" />
        <Button onClick={handleSaveSettings} variant="outlined" size="large">Save Settings</Button>
      </Box>
    </Box>
  )
}

export default ConfigForm