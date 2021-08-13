import React from 'react'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import { CardActionArea, Box } from '@material-ui/core'
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
  const { cover, season, 
    // episodes, 
    width, height } = props
  return (
    <>
      <Card sx={{ maxWidth: width, minWidth: width }}>
        <CardActionArea>
          <CardMedia
            sx={{ height: height, 
            }}
            image={getImagePath(`/api/v1/image/${cover}`)}
            title={"title"}
          >
            <StyledBox>
            </StyledBox>
          </CardMedia>
        </CardActionArea>
      </Card>
      <Box sx={{pt: 1, fontSize: 14, fontWeight: 'bold'}}>
        {season === 0 ? 'Specials' : `Season ${season}`}
      </Box>
    </>
  )
}

export default SeasonCoverCard