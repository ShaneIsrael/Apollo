import React, { useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Table, TableBody,
  TableContainer, TableHead, TableRow, Typography, Paper, Divider
} from '@material-ui/core'
import TableCell, { tableCellClasses } from '@material-ui/core/TableCell'
import LocalMoviesIcon from '@material-ui/icons/LocalMovies'
import TvIcon from '@material-ui/icons/Tv'
import { styled } from '@material-ui/core/styles'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
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
  const [stats, setStats] = useState(null)

  React.useEffect(() => {
    async function fetch() {
      try {
        const resp = (await StatsService.getGeneralLibraryStats(library.id)).data
        setStats(resp)
      } catch (err) {
        console.error(err)
      }
    }
    fetch()
  }, [])

  if (!library) {
    return <div></div>
  }
  const LibraryIcon = library.type === 'series' ? <TvIcon sx={{ mr: 2 }} /> : <LocalMoviesIcon sx={{ mr: 2 }} />
  return (
    <Accordion>
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
        {!stats && <Loading size={250} />}
        {stats && 
          Object.keys(stats).map((table, i) => (
            <div key={i}>
              <Typography color="secondary" variant="subtitle1" sx={{fontWeight: 'bold'}}>{table.toUpperCase()}</Typography>
              <TableContainer  component={Paper}>
                <Table sx={{ minWidth: 300 }} size="small" aria-label="a dense table">
                  <TableBody>
                    {Object.keys(stats[table]).map((key) => (
                      <StyledTableRow
                        key={key}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <StyledTableCell component="th" scope="row">
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
        }

      </AccordionDetails>
    </Accordion>
  )

}

export default GeneralStatsTable