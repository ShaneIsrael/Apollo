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
import { Dashboard, Library, Configure, FourOhFour } from './views'
import { LibraryService } from "./services"


export default function App() {

  const [libraries, setLibraries] = React.useState(null)
  const [themeMode, setThemeMode] = React.useState('dark')

  React.useEffect(() => {
    async function fetch() {
      const resp = (await LibraryService.getLibraries()).data
      setLibraries(resp)
    }
    fetch()
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
              <Navigation toggleTheme={handleToggleTheme} libraries={libraries}>
                <Library libraries={libraries}/>
              </Navigation>
            </Route>
            <Route exact path="/configure">
              <Navigation toggleTheme={handleToggleTheme} libraries={libraries} >
                <Configure libraries={libraries} setLibraries={setLibraries}/>
              </Navigation>
            </Route>
            <Route path="/404">
              <Navigation toggleTheme={handleToggleTheme} libraries={libraries} title="Media Browser">
                <FourOhFour />
              </Navigation>
            </Route>
            <Route exact path="/">
              <Navigation toggleTheme={handleToggleTheme} libraries={libraries} title="Media Browser">
                <Dashboard/>
              </Navigation>
            </Route>
            <Route>
              <Navigation toggleTheme={handleToggleTheme} libraries={libraries} title="Media Browser">
                <FourOhFour />
              </Navigation>
            </Route>
          </Switch>
      </Router>
    </ThemeProvider>
  )
}