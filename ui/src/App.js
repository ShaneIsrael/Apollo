import React from "react"
import {
  HashRouter as Router,
  Switch,
  Route,
} from "react-router-dom"
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import { CssBaseline } from "@material-ui/core"
import { blue, pink } from "@material-ui/core/colors"
import { Navigation } from './components'
import { Dashboard, Library, Configure, FourOhFour, Series, Movie, Login } from './views'

import 'devextreme/dist/css/dx.dark.css'
import { LibraryService } from "./services"
import { getUser } from "./components/utils"

export default function App() {
  const [themeMode, setThemeMode] = React.useState('dark')
  const [libraries, setLibraries] = React.useState([])
  const [user, setUser] = React.useState(getUser())
  
  // TODO Get admin settings, if restricted require a logged in user
  // to see anything other than the login page. Do not fetch libraries if not logged in.

  // TODO If admin enabled. Do not show configure page unless signed in with
  // a role of admin. 

  // TODO automatically expire jwt token
  // https://www.bezkoder.com/react-jwt-auth/

  React.useEffect(() => {
    async function fetch() {
      const resp = (await LibraryService.getLibraries()).data
      setLibraries(resp)
    }
    fetch()
    return () => LibraryService.cancel()
  }, [setLibraries])

  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: blue,
      secondary: pink,
    },
    props: {
      // MuiButtonBase: {
      //   disableRipple: true // No more ripple, on the whole application!
      // }
    }
  })

  const handleToggleTheme = () => {
    if (themeMode === 'dark') setThemeMode('light')
    else setThemeMode('dark')
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
          <Switch>
            <Route exact path="/library/:tag">
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme} >
                <Library />
              </Navigation>
            </Route>
            <Route exact path="/series/view/:uuid">
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme}  title="Series View">
                <Series />
              </Navigation>
            </Route>
            <Route exact path="/movie/view/:uuid">
              <Navigation defaultLibraries={libraries} oggleTheme={handleToggleTheme}  title="Movie View">
                <Movie />
              </Navigation>
            </Route>
            <Route exact path="/configure">
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme}>
                {user && user.role === 'admin' ? 
                  <Configure libraries={libraries} setLibraries={setLibraries} />
                  :
                  <Login setUser={setUser} forwardPage="/configure" />
                }
              </Navigation>
            </Route>
            <Route path="/404">
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme}  title="Apollo">
                <FourOhFour />
              </Navigation>
            </Route>
            <Route exact path="/login">
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme}  title="Apollo">
                <Login setUser={setUser} forwardPage="/" />
              </Navigation>
            </Route>
            <Route exact path="/">
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme}  title="Apollo">
                <Dashboard libraries={libraries} />
              </Navigation>
            </Route>
            <Route>
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme}  title="Apollo">
                <FourOhFour />
              </Navigation>
            </Route>
          </Switch>
      </Router>
    </ThemeProvider>
  )
}