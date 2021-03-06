import React from 'react'
import { Alert, Box, Button, Grid, Paper, TextField, Typography } from '@mui/material'
import LoginIcon from '@mui/icons-material/Login'
import logo from '../../assets/logo.png'
import AuthService from '../../services/AuthService'
import { useHistory } from 'react-router-dom'

const LoginForm = ({setUser, forwardPage, prelabel}) => {

  const [username, setUsername] = React.useState(null)
  const [password, setPassword] = React.useState(null)
  const [error, setError] = React.useState(null)
  const history = useHistory()

  const handleLogin = async () => {
    try {
      const user = await AuthService.login(username, password)
      setUser(user)
      if (forwardPage) {
        history.push(forwardPage)
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data)
      } else {
        console.error(error)
      }
    }
  }
  const handleSubmit = (event) => {
    if (event.which === 13) {
      handleLogin()
    }
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2, width: '100%' }}>
      <Grid container justifyContent="center" sx={{ pt: 2 }}>
        <Grid container item justifyContent="center" xs={12}>
          <img src={logo} height={200} />
        </Grid>
        <Grid container item justifyContent="center" xs={12}>
          <Typography variant="h2">Apollo</Typography>
        </Grid>
        <Box sx={{ display: 'flex', flexDirection: 'column', p: 4, pt: 2, width: '100%' }}>
          {error && <Alert sx={{ mb: 2 }} variant="filled" severity="error">{error}</Alert>}
          <TextField onKeyPress={handleSubmit} onChange={(e) => setUsername(e.target.value)} sx={{ pb: 2 }} required label={prelabel ? `${prelabel} Username` : "Username"} />
          <TextField onKeyPress={handleSubmit} onChange={(e) => setPassword(e.target.value)} sx={{ pb: 2 }} required label={prelabel ? `${prelabel} Password` : "Password"} type="password" />
          <Button onClick={handleLogin} disabled={!(username && password)} variant="outlined" size="large" startIcon={<LoginIcon />}>Login</Button>
        </Box>
      </Grid>
    </Box>
  )
}

export default LoginForm