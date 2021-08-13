import React from 'react'
import PropTypes from 'prop-types'
import { Grid, Box, Tabs, Tab, Typography} from '@material-ui/core'
import { AddLibrary, EditLibraries, LiveServerLogs } from '../components'
import AdminSetup from '../components/widgets/AdminSetup';

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
    <Box sx={{ pl: 3, pr: 3, pt: 4 }}>
      <Tabs 
        textColor="primary"
        indicatorColor="primary"
        value={tab} onChange={handleTabChange}>
        <Tab label="Library" {...a11yProps(0)} />
        <Tab label="Admin Setup" {...a11yProps(1)} />
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
          <Grid item>
            <AdminSetup/>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  )
}

export default Configure