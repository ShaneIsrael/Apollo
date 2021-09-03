import React from 'react'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import { CardActionArea } from '@mui/material'
import { getImagePath } from '../utils'


const GeneralCoverCard = (props) => {
  let { cover, alt, width, height } = props

  if (width && !height) {
    height = (width/2) * 3
  }

  return (
    <>
      <Card sx={{
        // position: 'relative',
        maxWidth: width, minWidth: width, borderColor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black', borderWidth: '2px' }} variant="outlined">
        <CardActionArea>
          <CardMedia
            sx={{ height: height }}
            image={cover ? getImagePath(`/api/v1/image/${cover}`) : alt}
            title={"title"}
          >
          </CardMedia>
        </CardActionArea>
      </Card>
    </>
  )
}

export default GeneralCoverCard