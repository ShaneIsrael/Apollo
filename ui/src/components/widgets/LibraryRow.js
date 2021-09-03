import React from 'react'
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField, Stack, IconButton, Button, Tooltip } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import RefreshIcon from '@mui/icons-material/Refresh'
import { LibraryService } from '../../services'
import { useInterval } from '../utils'

const LibraryRow = ({ library, handleChange }) => {

  const [name, setName] = React.useState(library.name)
  const [type, setType] = React.useState(library.type)
  const [path, setPath] = React.useState(library.path)
  const [changed, setChanged] = React.useState(false)
  const [crawling, setCrawling] = React.useState(library.crawling)
  const [deleting, setDeleting] = React.useState(false)

  const [deleteConfirm, showDeleteConfirm] = React.useState(false)
  const [crawlConfirm, showCrawlConfirm] = React.useState(false)

  React.useEffect(() => {
    if (library.name !== name || library.type !== type || library.path !== path) {
      setChanged(true)
    } else {
      setChanged(false)
    }
  }, [name, type, path, library.name, library.type, library.path])

  const crawl = async () => {
    try {
      await LibraryService.crawl(library.id)
      handleChange('Crawl Initialized', 'info')
      showCrawlConfirm(false)
      setCrawling(true)
    } catch (err) {
      handleChange(err.response.data, 'error')
    }
  }

  const saveChange = async () => {
    try {
      await LibraryService.updateLibrary({
        id: library.id, name, type, path
      })
      handleChange('Library Updated!', 'success')
    } catch (err) {
      console.log(err)
      handleChange(err.response.data, 'error')
    }
  }

  const deleteLibrary = async () => {
    try {
      setDeleting(true)
      await LibraryService.deleteLibrary(library.id)
      handleChange('Library Deleted!', 'warning')
    } catch (err) {
      handleChange(err.response.data, 'error')
    }
  }

  useInterval(async () => {
    try {
      if (crawling) {
        const resp = (await LibraryService.isCrawling(library.id)).data
        setCrawling(resp)
      }
    } catch (err) {
      console.error(err)
    }
  }, 5000)

  const actionItems = (
    <Grid item>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton onClick={() => !crawling && showCrawlConfirm(true)} aria-label="crawl" size="medium" color={crawling ? 'warning' : 'info'}>
          <Tooltip title="Crawl Library" placement="bottom" arrow>
            <RefreshIcon sx={{
              animation: crawling ? 'spinright 1s infinite linear' : ''
            }} fontSize="inherit" />
          </Tooltip>
        </IconButton>
        <IconButton onClick={saveChange} aria-label="save" size="medium" disabled={!changed} color="success">
          <Tooltip title="Save Change" placement="bottom" arrow>
            <SaveIcon fontSize="inherit" />
          </Tooltip>
        </IconButton>
        <IconButton onClick={() => showDeleteConfirm(true)} aria-label="delete" size="medium" color="error">
          <Tooltip title="Delete" placement="bottom" arrow>
            <DeleteIcon fontSize="inherit" />
          </Tooltip>
        </IconButton>
      </Stack>
    </Grid>
  )

  const confirmDeleteItems = (
    <Grid item>
      <Stack sx={{ pl: 1 }} direction="row" alignItems="center" spacing={1}>
        {
          deleting ?
            <Button variant="outlined" size="small" disabled={true}
              startIcon={<RefreshIcon sx={{
                animation: 'spinright 1s infinite linear'
              }} fontSize="inherit" />
              }>
              Deleting...
            </Button>
            :
            <>
              <Button onClick={() => showDeleteConfirm(false)} size="small" variant="contained">Cancel</Button>
              <Button onClick={deleteLibrary} size="small" variant="contained" color="error">Delete</Button>
            </>
        }
      </Stack>
    </Grid>
  )

  const confirmCrawlItems = (
    <Grid item>
      <Stack sx={{ pl: 1 }} direction="row" alignItems="center" spacing={1}>
        <Button onClick={() => showCrawlConfirm(false)} size="small" variant="contained">Cancel</Button>
        <Button onClick={crawl} size="small" variant="contained" color="info">Crawl</Button>
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
          deleteConfirm || crawlConfirm ? deleteConfirm ? confirmDeleteItems : confirmCrawlItems : actionItems
        }
      </Grid>
    </>
  )
}

export default LibraryRow