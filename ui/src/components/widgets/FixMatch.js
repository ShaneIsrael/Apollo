import React from 'react'
import Box from '@material-ui/core/Box'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import { Divider, Grid, IconButton, ImageList, ImageListItem, ImageListItemBar, TextField, Typography } from '@material-ui/core'
import BuildIcon from '@material-ui/icons/Build'
import moment from 'moment'
import { MovieService, SeriesService } from '../../services'
import { useDebounce } from '../utils'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  px: 4,
}

export default function FixMatch(props) {
  const { open, close, setMatch, current, type } = props
  const [matches, setMatches] = React.useState([])
  const [searchText, setSearchText] = React.useState(null)
  let debouncedText = useDebounce(searchText, 1000)

  React.useEffect(() => {
    async function fetch() {
      try {
        let resp
        if (type === 'series') {
          resp = (await SeriesService.searchByTitle(debouncedText)).data
        }
        if (type === 'movie') {
          resp = (await MovieService.searchByTitle(debouncedText)).data
        }
        setMatches(resp)
      } catch (err) {
        console.error(err)
      }
    }
    if (debouncedText)
      fetch()
  }, [debouncedText, type])
  React.useEffect(() => {
    async function fetch() {
      if (open) {
        try {
          let resp
          if (type === 'series') {
            resp = (await SeriesService.searchById(current.id, 20)).data
          }
          if (type === 'movie') {
            resp = (await MovieService.searchById(current.id, 20)).data
          }
          setMatches(resp)
        } catch (err) {
          console.log(err)
        }
      }
    }
    fetch()
  }, [open, current.id, type])

  const handleSelect = async (match) => {

    try {
      let resp
      if (type === 'series') {
        resp = (await SeriesService.changeMetadata(current.id, match.id, current.Metadatum ? false : true)).data
      }
      if (type === 'movie') {
        resp = (await MovieService.changeMetadata(current.id, match.id, current.Metadatum ? false : true)).data
      }
      setMatch({...current, Metadatum: resp})
    } catch (err) {
      console.error(err)
    }
    close(false)
  }

  const handleCancel = () => {
    if (current.Metadatum) {
      return close(false) // close modal
    }
    return close(true) // go back
  }

  return (
    <Modal
      open={open}
      onClose={() => close(false)}
      aria-labelledby="fix-match-title"
      aria-describedby="fix-match-description"
    >
      <Box sx={{ ...style, width: '90%', maxWidth: 500 }}>
        <h2 id="fix-match-tital">Fix Match</h2>
        <Divider />
        <Grid container item justifyContent="center">
          {/* <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Name on disk</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography color="primary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>{current.name}</Typography>
          </Grid> */}
          <Grid item xs={12}>
            <TextField sx={{ width: '100%', mt: 2 }} onChange={(e) => setSearchText(e.target.value)} id="match-search-field" label={current.name} variant="outlined" size="small" />
          </Grid>
          {matches.length > 0 
          ?
          <ImageList sx={{ width: matches.length > 1 ? 400 : 300, height: 'auto', maxHeight: 400 }} cols={matches.length > 1 ? 2 : 1} gap={10}>
            {matches.map((match) => {
              if (match.poster_path) {
                return <ImageListItem key={match.poster_path}>
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${match.poster_path}`}
                    width="200"
                    height="300"
                    alt={match.name || match.title}
                    loading="lazy"
                  />
                  <ImageListItemBar
                    title={match.name || match.title}
                    subtitle={moment(match.first_air_date || match.release_date).format('YYYY')}
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        aria-label={`info about ${match.name}`}
                        onClick={() => handleSelect(match)}
                      >
                        <BuildIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              }
              return []
            })}
          </ImageList>
          :
          <Typography sx={{p: 2}}variant="h4">No matches found</Typography>
        } 
        </Grid>
        <Divider />
        <Grid sx={{ pt: 2, pb: 2 }} container item justifyContent="flex-end">
          <Button onClick={handleCancel} variant="outlined">Cancel</Button>
        </Grid>
      </Box>
    </Modal>
  )
}