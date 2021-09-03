import React from 'react'
import { Grid, Paper, Alert, AlertTitle, Snackbar, Box } from '@mui/material'
import { LibraryService } from '../../services'
import LibraryRow from './LibraryRow'


const EditLibraries = (props) => {
  const { libraries, setLibraries } = props
  const [alertOpen, setAlertOpen] = React.useState(false)
  const [alertData, setAlertData] = React.useState({})

  const handleChange = async (msg, type) => {
    try {
      console.log('updating')
      const resp = (await LibraryService.getLibraries()).data
      console.log('updated')
      setLibraries(resp)
      setAlertData({message: msg, type})
    } catch (err) {
      setAlertData({
        message: err.response.data,
        type: 'error'
      })
    }
    setAlertOpen(true)
  }
  const rows = libraries ? libraries.map(l => (
      <LibraryRow key={l.id} library={l} handleChange={(msg, type) => handleChange(msg, type)} />
  )) : []

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false)
  }

  return (
    <Paper sx={{ p: 2, flexGrow: 1, backgroundColor: 'rgba(0, 0, 0, 0)' }} elevation={1} >
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={alertOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
        <Alert variant="filled" onClose={handleSnackbarClose} severity={alertData.type} sx={{ width: '100%' }}>
          {alertData.message}
        </Alert>
      </Snackbar>
      <Grid container spacing={2}>
        {
          libraries && libraries.length > 0 ?
            rows
            :
            <Grid container item justifyContent="center" alignItems="center">
              <Alert sx={{width: '100%'}} variant="filled" severity="info">
                <AlertTitle>No Libraries Configured</AlertTitle>
                Please add a library using the form below.
              </Alert>
            </Grid>
        }
      </Grid>
    </Paper>
  )
}

export default EditLibraries