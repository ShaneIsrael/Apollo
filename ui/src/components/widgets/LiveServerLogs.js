import React from 'react';
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const URL = window.location.port ? 
  Number(window.location.port) === 6969 ? `wss://${window.location.hostname}:6969` : `wss://${window.location.hostname}:3001`
  : `wss://${window.location.host}${window.location.pathname}`
  
const LiveServerLogs = () => {
  const [logs, setLogs] = React.useState([])
  const webSocket = React.useRef(null)

  function appendLog(message) {
    const parsed = JSON.parse(message.data)
    setLogs(l => l.concat(parsed).slice(-50))
  }
  React.useEffect(() => {
    webSocket.current = new WebSocket(URL)
    webSocket.current.onmessage = appendLog
    return () => webSocket.current.close()
  }, [])

  return (
    <div>
      <Accordion defaultExpanded={false} sx={{backgroundColor: 'rgba(0, 0, 0, 0)'}}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Live Server Logs</Typography>
        </AccordionSummary>
        <div style={{}}>
          <AccordionDetails sx={{ maxHeight: 400, overflow: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
            {/* this div trickery is required to keep the scrollbar at the bottom of the logs*/}
            <div>
              {logs.map((log, i) => {
                return (
                  <div key={i}>
                    <Typography sx={{ display: 'inline-block', mr: 1 }} variant="subtitle2" color="primary">
                      {`${log.timestamp}`}
                    </Typography>
                    <Typography sx={{ display: 'inline-block' }} variant="subtitle2">
                      {`${log.message}`}
                    </Typography>
                  </div>
                )
              })}
            </div>
          </AccordionDetails>
        </div>
      </Accordion>
    </div>
  )
}

export default LiveServerLogs