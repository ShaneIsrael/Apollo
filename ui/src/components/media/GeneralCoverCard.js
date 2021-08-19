import React from 'react'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import { CardActionArea } from '@material-ui/core'
import { getImagePath } from '../utils'


const GeneralCoverCard = (props) => {
  let { cover, width, height } = props

  if (width && !height) {
    height = (width/2) * 3
  }

  return (
    <>
      <Card sx={{
        // position: 'relative',
        maxWidth: width, minWidth: width, borderColor: 'white', borderWidth: '1px' }} variant="outlined">
        <CardActionArea>
          <CardMedia
            sx={{ height: height }}
            image={getImagePath(`/api/v1/image/${cover}`)}
            title={"title"}
          >
          </CardMedia>
        </CardActionArea>
      </Card>
    </>
  )
}

export default GeneralCoverCard