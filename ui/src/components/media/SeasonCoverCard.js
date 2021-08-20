import React from 'react'
import Card from '@material-ui/core/Card'
import { NavLink } from 'react-router-dom'
import CardMedia from '@material-ui/core/CardMedia'
import { CardActionArea, Box, Grid } from '@material-ui/core'
import { styled } from '@material-ui/core/styles'
import { getImagePath } from '../utils'

const StyledBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  height: '100%',
  padding: theme.spacing(0.75),
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0)'
}))

const SeasonCoverCard = (props) => {
  const { cover, seriesId, season, width, height } = props
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
        <Box sx={{ pt: 1, fontSize: 14, fontWeight: 'bold' }}>
          {season === 0 ? 'Specials' : `Season ${season}`}
        </Box>
      </Grid>
    </>
  )
}

export default SeasonCoverCard