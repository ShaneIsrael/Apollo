import React from 'react'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import { CardActionArea, Box, Grid, Typography } from '@material-ui/core'
import { styled } from '@material-ui/core/styles'
import HdIcon from '@material-ui/icons/Hd'
import SdIcon from '@material-ui/icons/Sd'
import FourKIcon from '@material-ui/icons/FourK'

import testimage from '../../assets/testimage.jpg'
import { orange } from '@material-ui/core/colors'

import { MediaService } from '../../services'


const StyledBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  padding: theme.spacing(0.75),
  // paddingBottom: theme.spacing(0.5),
  color: orange[500],
  width: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.7)'
}))

const MediaCard = (props) => {
  const { data, type} = props
  const hms = new Date(data.runtime * 1000).toISOString().substr(11, 8).split(':')

  const QualityIcon = data.width >= 3840 ? 
    <FourKIcon sx={{color: 'gold'}} fontSize="medium" /> 
    : 
      data.width >= 1080 ?
      <HdIcon sx={{color: 'white'}} fontSize="medium"/>
      :
      <SdIcon sx={{color: 'gray'}} fontSize="medium"/>
  return (
    <>
      <Card sx={{ maxWidth: 200, minWidth: 200 }}>
        <CardActionArea>
          <CardMedia
            sx={{ height: 300 }}
            image={data.poster ? `http://shaneisrael.net:1338/api/v1/image/${data.poster}` : ''}
            title={data.title}
          >
            <StyledBox>
              <Grid container alignItems="center">
              { type === 'series' ?
                <>
                  <Grid sx={{borderBottom: 0}} container>
                    <Grid item xs={6}>
                      <Typography sx={{fontSize: 12, fontWeight: 'bold'}} variant="h6">
                        {data.seasons > 1 ? `${data.seasons < 10 ? `0${data.seasons}` : data.seasons} Seasons` : '01 Season'}
                      </Typography>
                    </Grid>
                    <Grid container item xs={6} justifyContent="flex-end">
                      <Typography sx={{fontSize: 12, fontWeight: 'bold', color: 'primary.main'}} variant="h6">
                        {data.runtime ? `~ ${Math.round(data.runtime/60/60)} Hours` : ''}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid container item xs={6}>
                      <Typography sx={{fontSize: 12, fontWeight: 'bold'}} variant="h6">{data.episodes > 1 ? `${data.episodes} Episodes` : '1 Episode'}</Typography>
                    </Grid>
                    <Grid container item xs={6} justifyContent="flex-end">
                      {QualityIcon}
                    </Grid>
                  </Grid>
                </>
                :
                <>
                  <Grid container>
                    <Grid container item sx={{minHeight: 19}} xs={12} >
                      <Typography sx={{fontSize: 12, fontWeight: 'bold', color: 'primary.main'}} variant="h6">
                        {data.runtime ?  `${Number(hms[0])} hr ${hms[1]} mins`: ''}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid container item xs={12} justifyContent="flex-end">
                      {QualityIcon}
                    </Grid>
                  </Grid>
                </>
              } 
              </Grid>
            </StyledBox>
          </CardMedia>
        </CardActionArea>

      </Card>
      <Box sx={{padding: '10px', maxWidth: 200, fontSize: 14, fontWeight: 'bold'}}>
        {data.title}
      </Box>
    </>
  )
}

export default MediaCard