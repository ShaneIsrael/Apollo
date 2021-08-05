import * as React from 'react'
import { styled, alpha, useTheme } from '@material-ui/core/styles'
import { NavLink, useParams, useLocation } from 'react-router-dom'
import Box from '@material-ui/core/Box'
import Toolbar from '@material-ui/core/Toolbar'
import MuiDrawer from '@material-ui/core/Drawer'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import InputBase from '@material-ui/core/InputBase'
import MenuIcon from '@material-ui/icons/Menu'
import SearchIcon from '@material-ui/icons/Search'
import MuiAppBar from '@material-ui/core/AppBar'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import SettingsIcon from '@material-ui/icons/Settings'
import LocalMoviesIcon from '@material-ui/icons/LocalMovies'
import TvIcon from '@material-ui/icons/Tv'
import HomeIcon from '@material-ui/icons/Home'
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh'
import Brightness4Icon from '@material-ui/icons/Brightness4'
import { Fade, Tooltip } from '@material-ui/core'
import { LibraryService } from '../../services'
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
  }
]

const capitalize = ([firstLetter, ...restOfWord]) => {
  const capitalizedFirstLetter = firstLetter.toUpperCase()
  const restOfWordString = restOfWord.join('')
  return capitalizedFirstLetter + restOfWordString
}
export default function Navigation(props) {
  const { toggleTheme, children } = props
  let { title } = props

  const [libraries, setLibraries] = React.useState([])
  const theme = useTheme()
  const location = useLocation()
  let { tag, page } = useParams()
  if (!page) {
    page = location.pathname.split('/').pop()
  }
  const [open, setOpen] = React.useState(false)
  const [selectedPage, setSelectedPage] = React.useState(tag || page || '') //empty is root home page

  React.useEffect(() => {
    async function fetch() {
      const resp = (await LibraryService.getLibraries()).data
      setLibraries(resp)
    }
    fetch()
  }, [setLibraries])

  let libraryPages = createLibraryPages(libraries)

  React.useEffect(() => {
    setSelectedPage(tag || page)
  }, [tag, page])

  if (!title && page) {
    title = capitalize(page)
  }

  const lp = libraryPages.filter((library) => library.tag === tag)[0]
  if (lp) {
    title = lp.name
  } else if(tag) {
    title = `Library / ${capitalize(tag.split('-').join(' '))}`
  }

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false);
  }

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { libraries, setLibraries })
    }
    return child
  })

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={open}>
        <Toolbar variant="dense">
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
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            {title}
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon size="small"/>
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          <Box sx={{ display: { xs: 'flex', md: 'flex' } }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="theme toggle"
              aria-haspopup="true"
              onClick={toggleTheme}
              color="inherit"
            >
              {theme.palette.mode === 'dark' ? <BrightnessHighIcon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader >
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
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
                  return <Li key={library.tag} button
                    // onClick={() => handleLibraryChange(library)}
                    component={NavLink} to={`/library/${library.tag}`}
                  >
                    <ListItemIcon sx={selected ? { color: 'primary.main' } : {}}>
                      {library.icon}
                    </ListItemIcon>
                    <ListItemText primary={library.name} />
                  </Li>
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
      <Box component="main" sx={{ flexGrow: 1, paddingLeft: 0, paddingRight: 0, paddingTop: 5 }}>
        {childrenWithProps}
      </Box>
    </Box>
  );
}