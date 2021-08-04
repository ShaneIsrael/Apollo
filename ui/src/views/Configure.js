import React from 'react'
import { Grid } from '@material-ui/core'
import { AddLibrary, EditLibraries, LiveServerLogs } from '../components'
import { LibraryService } from "../services"

const Configure = (props) => {
  const { libraries, setLibraries } = props

  React.useEffect(() => {
    async function fetch() {
      const resp = (await LibraryService.getLibraries()).data
      setLibraries(resp)
    }
    fetch()
  }, [setLibraries])

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <EditLibraries libraries={libraries} setLibraries={setLibraries} />
        </Grid>
        <Grid item xs={12}>
          <AddLibrary setLibraries={setLibraries} />
        </Grid>
        <Grid item xs={12}>
          <LiveServerLogs />
        </Grid>
      </Grid>
    </>
  )
}

export default Configure