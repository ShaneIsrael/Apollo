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


export default function App() {
  const [themeMode, setThemeMode] = React.useState('dark')

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
              <Navigation toggleTheme={handleToggleTheme} >
                <Library />
              </Navigation>
            </Route>
            <Route exact path="/series/view/:uuid">
              <Navigation toggleTheme={handleToggleTheme}  title="Series View">
                <Series />
              </Navigation>
            </Route>
            <Route exact path="/movie/view/:uuid">
              <Navigation toggleTheme={handleToggleTheme}  title="Movie View">
                <Movie />
              </Navigation>
            </Route>
            <Route exact path="/configure">
              <Navigation toggleTheme={handleToggleTheme}  >
                <Configure />
              </Navigation>
            </Route>
            <Route path="/404">
              <Navigation toggleTheme={handleToggleTheme}  title="Media Browser">
                <FourOhFour />
              </Navigation>
            </Route>
            <Route exact path="/">
              <Navigation toggleTheme={handleToggleTheme}  title="Media Browser">
                <Dashboard/>
              </Navigation>
            </Route>
            <Route>
              <Navigation toggleTheme={handleToggleTheme}  title="Media Browser">
                <FourOhFour />
              </Navigation>
            </Route>
          </Switch>
      </Router>
    </ThemeProvider>
  )
}