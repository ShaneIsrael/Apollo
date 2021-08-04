import { Grid, Paper, TextField } from '@material-ui/core'
import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { MediaCard, Loading } from '../components'
import { LibraryService } from '../services'
import { useDebounce } from '../components/utils'

function createMediaCard(media, type) {
  return (
    <Grid key={media.id} item>
      <MediaCard data={media} type={type} />
    </Grid>
  )
}

const Library = (props) => {
  const { libraries } = props
  const { tag } = useParams()

  const [media, setMedia] = React.useState([])
  const [filteredMedia, setFilteredMedia] = React.useState([])
  const [filteredText, setFilteredText] = React.useState('')

  const [cardDisplayAmount, setCardDisplayAmount] = React.useState(50)

  const debouncedFilteredText = useDebounce(filteredText, 650) // so the filter is less laggy
  const debouncedCardDisplayAmount = useDebounce(cardDisplayAmount, 200)

  const [cards, setCards] = React.useState([])
  const [mediaType, setMediaType] = React.useState(null)
  const lib = libraries ? libraries.find((e) => e.tag === tag) : '/Loading...'
  const [library, setLibrary] = React.useState(lib)

  const [scrollPosition, setScrollPosition] = React.useState(null)
  React.useEffect(() => {
    const onScroll = e => {
      if (e.target.documentElement.scrollTop >= scrollPosition) {
        setScrollPosition(e.target.documentElement.scrollTop)
        setCardDisplayAmount(50 + Math.round(e.target.documentElement.scrollTop / 50))
      }
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [scrollPosition])

  React.useEffect(() => {
    async function fetch() {
      if (library) {
        let resp
        if (library.type === 'series') {
          resp = (await LibraryService.getAllLibrarySeries(library.id)).data
        }
        if (library.type === 'movie') {
          resp = (await LibraryService.getAllLibraryMovies(library.id)).data
        }
        if (resp) {
          setMediaType(library.type)
          setMedia(resp)
          setFilteredMedia(resp)
        }
      }
    }
    fetch()
  }, [library])

  React.useEffect(() => {
    const filteredCards = filteredMedia.slice(cards.length, debouncedCardDisplayAmount).map((m) => createMediaCard(m, mediaType))
    setCards(c => c.concat(filteredCards))
  }, [filteredMedia, debouncedCardDisplayAmount, mediaType])

  React.useEffect(() => {
    if (libraries) {
      setLibrary(libraries.find((e) => e.tag === tag))
    }
    setMedia([])
  }, [tag, libraries])

  const filterHandler = (event) => {
    setFilteredText(event.target.value)
  }

  React.useEffect(() => {
    const filtered = media.filter((m) => m.title.toLowerCase().indexOf(debouncedFilteredText.toLowerCase()) >= 0)
    const filteredMedia = filtered.slice(0, 50).map((m) => createMediaCard(m, mediaType))
    setCards(filteredMedia)
  }, [debouncedFilteredText, media, mediaType])

  if (!library) {
    return <Redirect from={`/library/${tag}`} to="/404" />
  }
  return (
    <>
      <Grid container justifyContent="center">
        <Paper sx={{ position: 'fixed', zIndex: 2, width: '80%', maxWidth: 600 }}>
          <TextField sx={{ width: '100%', maxWidth: 600 }} id="filter" label={`Filter ${library.name}`} variant="outlined" onChange={filterHandler} />
        </Paper>
      </Grid>
      <Grid sx={{ pt: 9 }} container>
        {cards.length === 0 ?
          <Grid sx={{ height: '50vh' }} container justifyContent="center" alignItems="center" item>
            <Loading disableShrink size={100} />
          </Grid>
          :
          <Grid container justifyContent="center" item spacing={1}>
            {cards}
          </Grid>
        }
      </Grid>
    </>
  )
}

export default Library