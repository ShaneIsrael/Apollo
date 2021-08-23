import { Box, Grid, Paper, TextField } from '@material-ui/core'
import React from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { MediaCard, Loading } from '../components'
import { LibraryService } from '../services'
import { useDebounce } from '../components/utils'
import background from '../assets/blurred-background-01.png'
import match_not_found from '../assets/match_not_found.png'

function createMediaCard(media, type) {
  return (
    <Grid key={media.uuid} item>
      <MediaCard data={media} alt={match_not_found} type={type} />
    </Grid>
  )
}

const Library = () => {
  const { tag } = useParams()

  const [media, setMedia] = React.useState([])
  const [filteredMedia, setFilteredMedia] = React.useState([])
  const [filteredText, setFilteredText] = React.useState('')

  const [cardDisplayAmount, setCardDisplayAmount] = React.useState(50)

  const debouncedFilteredText = useDebounce(filteredText, 650) // so the filter is less laggy
  const debouncedCardDisplayAmount = useDebounce(cardDisplayAmount, 200)

  const [cards, setCards] = React.useState([])
  const [mediaType, setMediaType] = React.useState(null)
  const [library, setLibrary] = React.useState(null)
  const [invalidPage, setInvalidPage] = React.useState(false)

  const [scrollRef, setScrollRef] = React.useState(null)
  const [scrollPosition, setScrollPosition] = React.useState(null)

  function initializeCards() {
    const filtered = media.filter((m) => m.title.toLowerCase().indexOf(debouncedFilteredText.toLowerCase()) >= 0)
    const cards = filtered.slice(0, 50).map((m) => createMediaCard(m, mediaType))
    setCards(cards)
  }

  function filterAndSetCards() {
    const filteredCards = filteredMedia.slice(cards.length, debouncedCardDisplayAmount).map((m) => createMediaCard(m, mediaType))
    setCards(c => c.concat(filteredCards))
  }

  const filterHandler = (event) => {
    if (!event.target.value) {
      setScrollPosition(0)
    }
    setFilteredText(event.target.value)
  }

  React.useEffect(() => {
    const onScroll = e => {
      if (e.target.scrollTop >= scrollPosition) {
        setScrollPosition(e.target.scrollTop)
        setCardDisplayAmount(50 + Math.round(e.target.scrollTop / 50))
      }
    }
    if (scrollRef) {
      scrollRef.addEventListener("scroll", onScroll)
      return () => scrollRef.removeEventListener("scroll", onScroll)
    }
  }, [scrollPosition, scrollRef])

  React.useEffect(() => {
    async function fetch() {
      const libRes = (await LibraryService.getLibraryByTag(tag)).data
      if (libRes) {
        let libMedia
        if (libRes.type === 'series') {
          libMedia = (await LibraryService.getAllLibrarySeries(libRes.id)).data
        }
        if (libRes.type === 'movie') {
          libMedia = (await LibraryService.getAllLibraryMovies(libRes.id)).data
        }
        setLibrary(libRes)
        setMediaType(libRes.type)
        setMedia(libMedia)
        setFilteredMedia(libMedia)
      } else {
        setInvalidPage(true)
      }
    }
    // setCards([])
    // setMedia([])
    // setFilteredMedia([])
    fetch()
    setFilteredText('')
  }, [tag])

  React.useEffect(() => {
    filterAndSetCards()
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedCardDisplayAmount])

  React.useEffect(() => {
    initializeCards()
  }, [debouncedFilteredText, media])

  if (invalidPage) {
    return <Redirect from={`/library/${tag}`} to="/404" />
  }

  if (!library) {
    return (
      <Grid sx={{ pt: 9 }} container>
        <Grid sx={{ height: '50vh ' }} container item justifyContent="center" alignItems="center">
          <Loading disableShrink size={100} />
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: (theme) => theme.palette.mode === 'dark' ? `url("${background}") no-repeat center center fixed` : '',
        backgroundSize: '100% 100%', width: '100%', height: '100vh',
        filter: 'brightness(35%)',
        // filter: 'opacity(35%)'
      }} />
      <Box ref={elem => setScrollRef(elem)} sx={{ position: 'relative', pt: 2, flexGrow: 1, maxHeight: '97vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0 }  }}>
        {cards &&
          <Grid container item justifyContent="center">
            <Paper sx={{ position: 'fixed', zIndex: 2, width: '80%', maxWidth: 600, opacity: '95%' }}>
              <TextField sx={{ width: '100%', maxWidth: 600 }} id="filter" label={`Filter ${library.name}`} variant="outlined" value={filteredText} onChange={filterHandler} />
            </Paper>
          </Grid>
        }
        <Grid sx={{ pt: 9 }} container>
          {cards.length === 0 ?
            <Grid sx={{ height: '50vh' }} container justifyContent="center" alignItems="center" item>
              <Loading size={100} />
            </Grid>
            :
            <Grid container justifyContent="center" item spacing={2}>
              {cards}
            </Grid>
          }
        </Grid>
      </Box>
    </>
  )
}

export default Library