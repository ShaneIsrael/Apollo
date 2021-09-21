import React from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Button from '@mui/material/Button'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import { Divider, Grid, Paper, Table, TableBody, TableContainer, Typography, TableRow, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { styled } from '@mui/material/styles'
import zIndex from '@mui/material/styles/zIndex'

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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  px: 4,
}

const MetadataModal = ({ title, metadata, open, close }) => {

  const [data, setData] = React.useState(metadata || [])

  return (
    <Modal
      open={open}
      onClose={close}
      aria-labelledby="view-metadata"
      aria-describedby="view-metadata-description"
    >
      <Box sx={{ ...style, width: '80%', maxHeight: '80%', overflowY: 'scroll' }}>
        <h2 id="view-metadata">{title}</h2>
        <Divider />
        <div>
          {
            data.map((d, index) => {
              const title = d["title"] ? d.title : d.data.filename
              return <Accordion key={index} defaultExpanded={data.length === 1}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-content`}
                >
                  <Typography color={title === 'General Info' ? 'primary' : 'secondary'} variant="caption" sx={{ fontSize: 15, fontWeight: 'bold' }}>{title.toUpperCase()}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 300, borderRadius: 0 }} size="small" aria-label="a dense table">
                      <TableBody>
                        {Object.keys(d.data).map((key, index) => (
                          <StyledTableRow
                            hover
                            key={index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <StyledTableCell component="th" scope="row"  >
                              {key}
                            </StyledTableCell>
                            <StyledTableCell align="right">{d.data[key]}</StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
              // </Grid>
            }
            )
          }
        </div>
        <Divider />
        <Grid sx={{ pt: 2, pb: 2 }} container item justifyContent="flex-end">
          <Button onClick={close} variant="outlined">Close</Button>
        </Grid>
      </Box>
    </Modal>
  )
}

export default MetadataModal