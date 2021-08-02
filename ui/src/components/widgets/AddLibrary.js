import React from 'react'
import { Button, Grid, Paper, TextField, Snackbar, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'
import MuiAlert from '@material-ui/core/Alert'
import { LibraryService } from '../../services'


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
});

const LibraryWidget = (props) => {
  const { setLibraries } = props

  const [libraryPathText, setLibraryPathText] = React.useState('')
  const [libraryNameText, setLibraryNameText] = React.useState('')
  const [libraryType, setLibraryType] = React.useState('')

  const [libraryPathFieldColor, setLibraryPathFieldColor] = React.useState('warning')
  const [libraryFieldValid, setLibraryFieldValid] = React.useState(false)
  const [addingLibrary, setAddingLibrary] = React.useState(false)
  const [notificationOpen, setNotificationOpen] = React.useState(false)
  const [notificationText, setNotificationText] = React.useState('')
  const [addLibrarySucceeded, setAddLibrarySucceeded] = React.useState(false)

  const validatePath = async() => {
    const validPath = (await LibraryService.validateLibraryPath(libraryPathText)).data
    setLibraryFieldValid(validPath)
    setLibraryPathFieldColor(validPath ? 'success' : 'error')
    if (!validPath) {
      setNotificationOpen(true)
      setNotificationText('Invalid Library Path!')
    }
  }
  const handleSubmit = async (event) => {
    if (event.which === 13) { // enter key pressed
      validatePath()
    }
  }
  const handlePathTextChange = (event) => {
    setLibraryPathFieldColor('warning')
    setLibraryFieldValid(false)
    setLibraryPathText(event.target.value)
  }
  const handleAddLibrary = async () => {
    setAddingLibrary(true)
    try {
      await LibraryService.createLibrary(libraryNameText, libraryPathText, libraryType)
      setAddLibrarySucceeded(true)
      setNotificationOpen(true)
      setNotificationText('Library Added!')
      setLibraryType('')
      setLibraryNameText('')
      setLibraryPathText('')
      setLibraryPathFieldColor('warning')
    } catch (err) {
      setNotificationOpen(true)
      setAddLibrarySucceeded(false)
      setNotificationText(err.response.data)
    }
    setAddingLibrary(false)
    setLibraryFieldValid(false)
    try {
      const resp = (await LibraryService.getLibraries()).data
      setLibraries(resp)
    } catch (err) {
      setNotificationOpen(true)
      setAddLibrarySucceeded(false)
      setNotificationText('Error retrieving libraries')
    }
  }
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotificationOpen(false)
    setNotificationText('')
  }

  return (
    <>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={notificationOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert variant="filled" onClose={handleSnackbarClose} severity={addLibrarySucceeded ? 'success' : 'error'} sx={{ width: '100%' }}>
          {notificationText}
        </Alert>
      </Snackbar>
      <Paper sx={{ p: 2, flexGrow: 1}}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl required sx={{width: '100%' }} success={String(libraryType !== '')} color={'success'} focused={libraryType !== ''}>
              <InputLabel id="add-library-type-label">Library Type</InputLabel>
              <Select
                labelId="add-library-type-label"
                id="add-library-type"
                value={libraryType}
                label="Library Type *"
                onChange={(e) => setLibraryType(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={'series'}>Series</MenuItem>
                <MenuItem value={'movie'}>Movie</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              sx={{width: '100%'}}
              color={'success'}
              value={libraryNameText}
              focused={libraryNameText !== '' ? true : false}
              id="add-library-name" 
              label="Library Name *" 
              variant="outlined"
              onChange={(e) => setLibraryNameText(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              sx={{width: '100%'}}
              color={libraryPathFieldColor}
              value={libraryPathText}
              focused={libraryPathText !== '' ? true : false}
              id="add-library-path" 
              label="Library Path *" 
              variant="outlined"
              onKeyPress={handleSubmit}
              onChange={handlePathTextChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              sx={{width: '100%'}}
              variant="contained"
              color={libraryPathFieldColor}
              disabled={!libraryPathText}
              onClick={validatePath}
            >
              Validate Path
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
              <Button
                sx={{width: '100%'}}
                variant="contained"
                color={libraryPathFieldColor}
                disabled={(!libraryFieldValid || addingLibrary) || !libraryType || !libraryNameText}
                onClick={handleAddLibrary}
              >
                {addingLibrary ? 'Adding...' : 'Add Library'}
              </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}

export default LibraryWidget