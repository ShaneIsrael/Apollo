import React from 'react'
import Card from '@material-ui/core/Card'
import { CardActionArea, Box } from '@material-ui/core'
import { NavLink } from 'react-router-dom'
import { getImagePath } from '../utils'

import Image from 'material-ui-image'


const MediaCard = (props) => {
  const { data, type} = props

  // const QualityIcon = data.width >= 3840 ? 
  //   <FourKIcon sx={{color: 'gold'}} fontSize="medium" /> 
  //   : 
  //     data.width >= 1080 ?
  //     <HdIcon sx={{color: 'white'}} fontSize="medium"/>
  //     :
  //     <SdIcon sx={{color: 'gray'}} fontSize="medium"/>
  return (
    <>
      <Card sx={{ maxWidth: 200, minWidth: 200 }}>
        <CardActionArea component={NavLink} 
            to={`/${type}/view/${data.uuid}`}>
          <Image
            src={data.poster ? getImagePath(`/api/v1/image/${data.poster}`) : ''}
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