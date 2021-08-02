import React from 'react'
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField, Stack, IconButton, Button } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import SaveIcon from '@material-ui/icons/Save'
import { LibraryService } from '../../services'

const LibraryRow = ({ library, handleChange }) => {

  const [name, setName] = React.useState(library.name)
  const [type, setType] = React.useState(library.type)
  const [path, setPath] = React.useState(library.path)
  const [changed, setChanged] = React.useState(false)

  const [confirm, showConfirm] = React.useState(false)

  React.useEffect(() => {
    if (library.name !== name || library.type !== type || library.path !== path) {
      setChanged(true)
    } else {
      setChanged(false)
    }
  }, [name, type, path, library.name, library.type, library.path])

  const saveChange = async () => {
    try {
      await LibraryService.updateLibrary({
        id: library.id, name, type, path
      })
      handleChange('Library Updated!', 'success')
    } catch (err) {
      handleChange(err.response.data, 'error')
    }

  }

  const deleteLibrary = async () => {
    try {
      await LibraryService.deleteLibrary(library.id)
      handleChange('Library Deleted!', 'warning')
    } catch (err) {
      handleChange(err.response.data, 'error')
    }
  }

  const actionItems = (
    <Grid item>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton onClick={saveChange} aria-label="save" size="medium" disabled={!changed} color="success">
          <SaveIcon fontSize="inherit" />
        </IconButton>
        <IconButton onClick={() => showConfirm(true)} aria-label="delete" size="medium" color="error">
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </Stack>
    </Grid>
  )

  const confirmDeleteItems = (
    <Grid item>
      <Stack sx={{pl: 1}} direction="row" alignItems="center" spacing={1}>
        <Button onClick={() => showConfirm(false)} size="small" variant="contained">Cancel</Button>
        <Button onClick={deleteLibrary} size="small" variant="contained" color="error">Delete</Button>
      </Stack>
    </Grid>
  )

  return (
    <>
      <Grid item xs={3}>
        <TextField
          sx={{ width: '100%' }}
          value={name}
          id="edit-library-name"
          label="Library Name"
          variant="outlined"
          size="small"
          color={name !== library.name ? 'warning' : ''}
          focused={name !== library.name}
          onChange={(e) => setName(e.target.value)}
        />
      </Grid>
      <Grid item xs={2}>
        <FormControl required sx={{ width: '100%' }} color={type !== library.type ? 'warning' : ''} focused={type !== library.type}>
          <InputLabel id="edit-library-type-label">Library Type</InputLabel>
          <Select
            labelId="edit-library-type-label"
            id={"edit-library-type-id"}
            value={type}
            label="Library Type"
            size="small"
            disabled
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value={'series'}>Series</MenuItem>
            <MenuItem value={'movie'}>Movie</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid container item xs={7} alignItems="center">
        <Grid item xs>
          <TextField
            sx={{ width: '100%' }}
            value={path}
            id="edit-library-path"
            label="Library Path"
            variant="outlined"
            size="small"
            color={path !== library.path ? 'warning' : ''}
            focused={path !== library.path}
            disabled
            onChange={(e) => setPath(e.target.value)}
          />
        </Grid>
        {
          confirm ? confirmDeleteItems : actionItems
        }
      </Grid>
    </>
  )
}

export default LibraryRow