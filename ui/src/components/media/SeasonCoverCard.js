import React from 'react'
import Card from '@mui/material/Card'
import { NavLink } from 'react-router-dom'
import CardMedia from '@mui/material/CardMedia'
import { CardActionArea, Box, Grid } from '@mui/material'
import { styled } from '@mui/material/styles'
import { getImagePath } from '../utils'

const StyledBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  height: '100%',
  padding: theme.spacing(0.75),
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0)'
}))

const SeasonCoverCard = (props) => {
  let { cover, seriesId, season, width, height } = props

  if (width && !height) {
    height = (width/2) * 3
  }

  if (height && !width) {
    width = (height/3) * 2
  }

  return (
    <>
      <Card sx={{
        maxWidth: width, minWidth: width,
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black', borderWidth: '2px'
      }} variant="outlined">
        <CardActionArea>
          <CardMedia
            component={NavLink}
            to={`/series/${seriesId}/season/${season}`}
            sx={{
              height: height,
            }}
            image={getImagePath(`/api/v1/image/${cover}`)}
            title={"title"}
          >
            <StyledBox>
            </StyledBox>
          </CardMedia>
        </CardActionArea>
      </Card>
      <Grid container justifyContent="center">
        <Box sx={{ pt: 1, fontSize: 16, fontWeight: 'bold' }}>
          {season === 0 ? 'Specials' : `Season ${season}`}
        </Box>
      </Grid>
    </>
  )
}

export default SeasonCoverCard