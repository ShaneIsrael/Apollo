import React from 'react'
import Card from '@material-ui/core/Card'
import { CardActionArea, Box } from '@material-ui/core'
import { NavLink } from 'react-router-dom'
import { getImagePath } from '../utils'

import Image from 'material-ui-image'


const MediaCard = (props) => {
  const { data, alt, type} = props

  return (
    <>
      <Card sx={{ maxWidth: 200, minWidth: 200, borderColor: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black', borderWidth: '1px' }} variant="outlined">
        <CardActionArea component={NavLink} 
            to={`/${type}/${type === 'series' ? data.seriesId : data.movieId}`}>
          <Image
            src={data.poster ? getImagePath(`/api/v1/image/${data.poster}`) : alt}
            style={{height: 300}}
            aspectRatio={(16/9)}
            color="#121212"
            disableSpinner
          />
        </CardActionArea>

      </Card>
      <Box sx={{padding: '10px', maxWidth: 200, fontSize: 14, fontWeight: 'bold'}}>
        {data.title}
      </Box>
    </>
  )
}

export default MediaCard