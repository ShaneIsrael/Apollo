import React from 'react'
import { styled, alpha, useTheme } from '@mui/material/styles'
import { NavLink, useParams, useLocation, useHistory } from 'react-router-dom'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import MuiAppBar from '@mui/material/AppBar'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import SettingsIcon from '@mui/icons-material/Settings'
import LocalMoviesIcon from '@mui/icons-material/LocalMovies'
import TvIcon from '@mui/icons-material/Tv'
import HomeIcon from '@mui/icons-material/Home'
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import InfoIcon from '@mui/icons-material/Info'
import Zoom from '@mui/material/Zoom'

import background from '../../assets/blurred-background-01-brightness-100.png'

// import { Fade, Tooltip } from '@mui/material'
import { LibraryService, MovieService, SeriesService } from '../../services'
import logo from '../../assets/logo.png'
import { Popover, Tooltip } from '@mui/material'
import { Series } from 'devextreme-react/chart'
import { leftOffsetMixin } from '../utils'

const drawerWidth = 240


const ListItemSelected = styled(ListItem)(({ theme }) => ({
  borderLeftColor: theme.palette.primary.main,
  borderLeftStyle: 'solid',
  borderLeftWidth: theme.spacing(0.4),
}))

const ListItemDefault = styled(ListItem)(({ theme }) => ({
  marginLeft: theme.spacing(0.4)
}))

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  height: 35,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '15ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}))

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
})

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  minHeight: '48px',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  // ...theme.mixins.toolbar,
}))

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
)

function createLibraryStats(stats) {
  if (stats.type === 'series') {
    return (
      <Typography variant="overline" color="primary" noWrap sx={{ fontSize: 15 }}>
        {`${stats.seriesCount.toLocaleString()} Series | ${stats.seasonCount.toLocaleString()} Seasons | ${stats.episodeCount.toLocaleString()} Episodes`}
      </Typography>
    )
  }
  if (stats.type === 'movie') {
    return (
      <Typography variant="overline" color="primary" noWrap sx={{ fontSize: 15 }}>
        {`${stats.movieCount.toLocaleString()} Movies`}
      </Typography>
    )
  }
}

function createLibraryPages(libraries) {
  if (!libraries) return []
  return libraries.map(({ name, path, type, tag }) => (
    {
      name,
      tag,
      icon: type === 'series' ? <TvIcon /> : <LocalMoviesIcon />,
      path,
    }
  ))
}

const pages2 = [
  {
    title: 'Configure',
    tag: 'configure',
    path: '/configure',
    icon: <SettingsIcon />
  },
  {
    title: 'About',
    tag: 'about',
    path: '/about',
    icon: <InfoIcon />
  }
]

const capitalize = ([firstLetter, ...restOfWord]) => {
  const capitalizedFirstLetter = firstLetter.toUpperCase()
  const restOfWordString = restOfWord.join('')
  return capitalizedFirstLetter + restOfWordString
}

export default function Navigation(props) {
  const { defaultLibraries, toggleTheme, logout, user, children } = props
  let { title } = props

  const [libraries, setLibraries] = React.useState(defaultLibraries)
  let history = useHistory()
  const theme = useTheme()
  const location = useLocation()
  let { tag, page } = useParams()
  if (!page) {
    page = location.pathname.split('/').pop()
  }
  const [open, setOpen] = React.useState(false)
  const [selectedPage, setSelectedPage] = React.useState(tag || page || '') //empty is root home page
  // const [user, setUser] = React.useState(user)

  const [navSearchText, setNavSearchText] = React.useState('')
  const [navSearchAnchorEl, setNavSearchAnchorEl] = React.useState(null)
  const [stats, setStats] = React.useState(null)

  React.useEffect(() => {
    async function fetch() {
      LibraryService.getLibraries().then(resp => setLibraries(resp.data))
        .catch(err => console.error(err))
    }
    fetch()
    return () => LibraryService.cancel()
  }, [setLibraries])

  let libraryPages = createLibraryPages(libraries)

  React.useEffect(() => {
    setSelectedPage(tag || page)
    async function fetchStats() {
      const library = libraries.find(lib => lib.tag === tag)
      if (library) {
        if (library.type === 'series') {
          const seriesCount = (await SeriesService.getSeriesCount(library.id)).data
          const seasonCount = (await SeriesService.getSeasonCount(library.id)).data
          const episodeCount = (await SeriesService.getEpisodeCount(library.id)).data
          setStats(createLibraryStats({
            type: library.type,
            seriesCount,
            seasonCount,
            episodeCount
          }))
        } else {
          const movieCount = (await MovieService.getMovieCount(library.id)).data
          setStats(createLibraryStats({
            type: library.type,
            movieCount,
          }))
        }
      } else {
        setStats(null)
      }
    }
    fetchStats()
  }, [tag, page, libraries])

  if (!title && page) {
    title = capitalize(page)
  }

  const lp = libraryPages.filter((library) => library.tag === tag)[0]
  if (lp) {
    title = lp.name
  } else if (tag) {
    title = `Library / ${capitalize(tag.split('-').join(' '))}`
  }

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false);
  }

  const handleSearchTextChange = (e) => {
    setNavSearchText(e.target.value)
  }

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { libraries, setLibraries, setStats })
    }
    return child
  })

  return (
    <Box sx={{ display: 'flex', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0 } }}>
      <AppBar position="fixed" open={open} elevation={1} >
        <Toolbar variant="dense" sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#fff', }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon sx={{ color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.54)' : '#fff' }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: -6 }}>
            <Box sx={{ flexWrap: 'nowrap', display: { xs: 'flex', sm: 'flex' }, cursor: 'grab', textDecoration: 'none' }} onClick={() => history.goBack()}>
              <img src={logo} style={{ height: 35, paddingRight: 10 }} />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.54)' : '#fff' }}
              >
                {title}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'none', md: 'flex' }, alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ flexWrap: 'nowrap', display: 'flex' }}>
              {stats}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Box sx={{ flexWrap: 'nowrap', display: 'flex' }}>
              <Box sx={{ pl: 1 }}>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="theme toggle"
                  aria-haspopup="true"
                  onClick={toggleTheme}
                  color="inherit"
                >
                  {theme.palette.mode === 'dark' ? <BrightnessHighIcon /> : <Brightness4Icon sx={{ color: 'rgba(0, 0, 0, 0.75)' }} />}
                </IconButton>
              </Box>
              <Box sx={{ pl: 1 }}>
                {user ?
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="theme toggle"
                    onClick={logout}
                    component={NavLink}
                    to={`/`}
                    color="secondary"
                  >
                    <Tooltip title={`Signed in as ${user.username}`} placement="bottom-start"><LogoutIcon /></Tooltip>
                  </IconButton>
                  :
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="theme toggle"
                    component={NavLink}
                    to={`/login`}
                    color="secondary"
                  >
                    <LoginIcon />
                  </IconButton>
                }
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader >
          {open &&
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          }
        </DrawerHeader>
        <Divider />
        <List>
          {selectedPage === '' ?
            <ListItemSelected
              button
              key={'home'}
              onClick={() => setSelectedPage('')}
              component={NavLink}
              to={`/`}
            >
              <ListItemIcon sx={{ color: 'primary.main' }} >
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={'Home'} />
            </ListItemSelected>
            :
            <ListItemDefault
              button
              key={'home'}
              onClick={() => setSelectedPage('')}
              component={NavLink}
              to={`/`}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={'Home'} />
            </ListItemDefault>
          }
        </List>
        {libraryPages.length > 0 &&
          <>
            <Divider />
            <List>
              {
                libraryPages.map((library, index) => {
                  const selected = selectedPage === library.tag
                  const Li = selected ? ListItemSelected : ListItemDefault
                  return <Tooltip key={library.tag} title={library.name} placement="right" TransitionComponent={Zoom}>
                    <Li button
                      // onClick={() => handleLibraryChange(library)}
                      component={NavLink} to={`/library/${library.tag}`}
                    >
                      <ListItemIcon sx={selected ? { color: 'primary.main' } : {}}>
                        {library.icon}
                      </ListItemIcon>
                      <ListItemText primary={library.name} />
                    </Li>
                  </Tooltip>
                })
              }
            </List>
          </>
        }
        <Divider />
        <List>
          {pages2.map((page, index) => {
            const selected = selectedPage === page.tag
            const Li = selected ? ListItemSelected : ListItemDefault
            return <Li
              button
              key={page.title}
              onClick={() => setSelectedPage(page.tag)}
              component={NavLink} to={`${page.path}`}
            >
              <ListItemIcon sx={selected ? { color: 'primary.main' } : null}>
                {page.icon}
              </ListItemIcon>
              <ListItemText primary={page.title} />
            </Li>
          })}
        </List>
      </Drawer>
      <Box component="main" sx={{
        flexGrow: 1, paddingLeft: 0, paddingRight: 0, paddingTop: 6,
        ...leftOffsetMixin(theme, open),
        height: '100vh',
        background: (theme) => theme.palette.mode === 'dark' ? `url("${background}") no-repeat center center fixed` : '',
        // backgroundSize: '100% 100%', width: '100%', height: '100vh',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }}>
        {childrenWithProps}
      </Box>
    </Box>
  );
}