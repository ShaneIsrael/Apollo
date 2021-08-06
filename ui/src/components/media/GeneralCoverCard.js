import React from 'react'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import { CardActionArea } from '@material-ui/core'



const GeneralCoverCard = (props) => {
  const { cover, width, height } = props

  return (
    <>
      <Card sx={{
        position: 'relative',
        maxWidth: width, minWidth: width, borderColor: 'white', borderWidth: '1px' }} variant="outlined">
        <CardActionArea>
          <CardMedia
            sx={{ height: height }}
            image={`http://shaneisrael.net:1338/api/v1/image/${cover}`}
            title={"title"}
          >
          </CardMedia>
        </CardActionArea>
      </Card>
    </>
  )
}

export default GeneralCoverCard