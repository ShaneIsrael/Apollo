import React, { useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Table, TableBody,
  TableContainer, TableRow, Typography, Paper, Grid, Alert, AlertTitle
} from '@mui/material'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import LocalMoviesIcon from '@mui/icons-material/LocalMovies'
import TvIcon from '@mui/icons-material/Tv'
import { styled } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { StatsService } from '../../services'
import Loading from '../progress/Loading'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));


const GeneralStatsTable = (props) => {
  const { library } = props
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    function fetch() {
      StatsService.getGeneralLibraryStats(library.id)
        .then(resp => {
          setStats(resp.data)
          setLoading(false)
        })
        .catch(err => console.error(err))
    }
    fetch()
    return () => StatsService.cancel()
  }, [library.id, setStats])

  if (!library) {
    return <div></div>
  }
  const LibraryIcon = library.type === 'series' ? <TvIcon sx={{ mr: 2 }} /> : <LocalMoviesIcon sx={{ mr: 2 }} />
  return (
    <Accordion sx={{ width: '100%', backgroundColor: 'rgba(0, 0, 0, 0)'}}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`library-${library.tag}-content`}
        id={`library-${library.tag}-header`}
      >
        <Typography color="primary" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {LibraryIcon}
          {library.name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {
          loading &&
          <Grid container justifyContent="center">
            <Loading size={250} />
          </Grid>
        }
        {
          stats ?
            Object.keys(stats).map((table, i) => (
              <div key={i}>
                <Typography color="secondary" variant="subtitle1" sx={{ fontWeight: 'bold' }}>{table.toUpperCase()}</Typography>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 300 }} size="small" aria-label="a dense table">
                    <TableBody>
                      {Object.keys(stats[table]).map((key) => (
                        <StyledTableRow
                          key={key}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <StyledTableCell component="th" scope="row" >
                            {key}
                          </StyledTableCell>
                          <StyledTableCell align="right">{stats[table][key]}</StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            ))
            :
            <Alert sx={{ width: '100%' }} variant="filled" severity="info">
              <AlertTitle>No Stats Generated</AlertTitle>
              Stats for this library have not yet been generated.
            </Alert>
        }
      </AccordionDetails>
    </Accordion >
  )

}

export default GeneralStatsTable