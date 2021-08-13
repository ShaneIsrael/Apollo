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
import { ConfigService, LibraryService } from "./services"
import { getUser, getLocalConfig, setLocalConfig } from "./components/utils"
import AuthVerify from "./components/utils/AuthVerify"
import AuthService from "./services/AuthService"

export default function App() {
  const [themeMode, setThemeMode] = React.useState('dark')
  const [libraries, setLibraries] = React.useState([])
 
  const [user, setUser] = React.useState(getUser())
  const [config, setConfig] = React.useState(getLocalConfig())
  // TODO Get admin settings, if restricted require a logged in user
  // to see anything other than the login page. Do not fetch libraries if not logged in.

  // TODO If admin enabled. Do not show configure page unless signed in with
  // a role of admin. 

  // TODO automatically expire jwt token
  // https://www.bezkoder.com/react-jwt-auth/

  React.useEffect(() => {
    async function fetch() {
      const config = (await ConfigService.getConfig()).data
      setConfig(oldConfig => ({
        ...oldConfig,
        ...config
      }))
      setLocalConfig(config)
    }
    fetch()
    return () => ConfigService.cancel()
  }, [setConfig])
  
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

  const logOut = () => {
    try {
      AuthService.logout()
      setUser(null)
      console.log('wtf')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {
        config.restrictAccess && !user ?
          <Router>
            <Switch>
              <Route>
                <Login setUser={setUser}/>
              </Route>
            </Switch>
          </Router>
        :
          <Router>
            <Switch>
              <Route exact path="/library/:tag">
                <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme} logout={logOut}>
                  <Library />
                </Navigation>
              </Route>
              <Route exact path="/series/view/:uuid">
                <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme} title="Series View" logout={logOut}>
                  <Series />
                </Navigation>
              </Route>
              <Route exact path="/movie/view/:uuid">
                <Navigation defaultLibraries={libraries} oggleTheme={handleToggleTheme} title="Movie View" logout={logOut}>
                  <Movie />
                </Navigation>
              </Route>
              <Route exact path="/configure">
                <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme} logout={logOut}>
                  {(!config.enableAdmin) || (config.enableAdmin && user && user.role === 'admin') ?
                    <Configure libraries={libraries} setLibraries={setLibraries} />
                    :
                    <Login setUser={setUser} />
                  }
                </Navigation>
              </Route>
              <Route path="/404">
                <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme} title="Apollo" logout={logOut}>
                  <FourOhFour />
                </Navigation>
              </Route>
              <Route exact path="/login">
                <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme} title="Apollo" logout={logOut}>
                  <Login setUser={setUser} forwardPage="/" />
                </Navigation>
              </Route>
              <Route exact path="/">
                <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme} title="Apollo" logout={logOut}>
                  <Dashboard libraries={libraries} />
                </Navigation>
              </Route>
              <Route>
                <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme} title="Apollo" logout={logOut}>
                  <FourOhFour />
                </Navigation>
              </Route>
            </Switch>
            <AuthVerify logOut={logOut} />
          </Router>
      }

    </ThemeProvider>
  )
}