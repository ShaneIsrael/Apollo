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
import { Dashboard, Library, Configure, FourOhFour, Series, Movie } from './views'

import 'devextreme/dist/css/dx.dark.css'
import { LibraryService } from "./services"

export default function App() {
  const [themeMode, setThemeMode] = React.useState('dark')
  const [libraries, setLibraries] = React.useState([])

  
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
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme}  >
                <Configure libraries={libraries} setLibraries={setLibraries} />
              </Navigation>
            </Route>
            <Route path="/404">
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme}  title="Media Browser">
                <FourOhFour />
              </Navigation>
            </Route>
            <Route exact path="/">
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme}  title="Media Browser">
                <Dashboard libraries={libraries} />
              </Navigation>
            </Route>
            <Route>
              <Navigation defaultLibraries={libraries} toggleTheme={handleToggleTheme}  title="Media Browser">
                <FourOhFour />
              </Navigation>
            </Route>
          </Switch>
      </Router>
    </ThemeProvider>
  )
}