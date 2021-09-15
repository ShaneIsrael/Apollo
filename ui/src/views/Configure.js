import React from 'react'
import PropTypes from 'prop-types'
import { Grid, Box, Tabs, Tab, Typography} from '@mui/material'
import { AddLibrary, EditLibraries, LiveServerLogs, ConfigForm } from '../components'

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
          {/* <Typography></Typography> */}
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const Configure = (props) => {
  const { libraries, setLibraries } = props
  const [tab, setTab] = React.useState(0)

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }
  return (
    <Box sx={{ pt: 3, pl: 3, pr: 3, maxHeight: '100%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', "&::-webkit-scrollbar": { width: 0, height: 0 } }}>
      <Tabs 
        textColor="primary"
        indicatorColor="primary"
        value={tab} onChange={handleTabChange}>
        <Tab label="Library" {...a11yProps(0)} />
        <Tab label="System Config" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={tab} index={0}>
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
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Grid container spacing={1} justifyContent="center">
          <Grid item xs={12} md={6}>
            <ConfigForm />
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  )
}

export default Configure