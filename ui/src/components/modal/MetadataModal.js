import React from 'react'
import Box from '@material-ui/core/Box'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import TableCell, { tableCellClasses } from '@material-ui/core/TableCell'
import { Divider, Grid, Paper, Table, TableBody, TableContainer, Typography, TableRow } from '@material-ui/core'
import { styled } from '@material-ui/core/styles'
import zIndex from '@material-ui/core/styles/zIndex'

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
      <Box sx={{ ...style, width: '80%' }}>
        <h2 id="view-metadata">{title}</h2>
        <Divider />
        <Grid container>
          {
            data.map((d, index) =>
              <Grid item xs={12} key={index}>
                <Typography color="secondary" variant="subtitle1" sx={{ fontWeight: 'bold' }}>{d.title}</Typography>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 300 }} size="small" aria-label="a dense table">
                    <TableBody>
                      {Object.keys(d.data).map((key, index) => (
                        <StyledTableRow
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
              </Grid>
            )
          }
        </Grid>
        <Divider />
        <Grid sx={{ pt: 2, pb: 2 }} container item justifyContent="flex-end">
          <Button onClick={close} variant="outlined">Close</Button>
        </Grid>
      </Box>
    </Modal>
  )
}

export default MetadataModal