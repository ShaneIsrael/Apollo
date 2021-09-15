import React from 'react'
import { Box, Avatar } from '@mui/material'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { getImagePath } from '../utils'


const CastCoverCard = (props) => {
  const { cast, size } = props

  return (
    <div style={{ padding: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* <Avatar  sx={{width: size, height: size,backgroundPosition: '50% 50%'}} /> */}
      <div style={{
        backgroundImage: `url('${getImagePath(`/api/v1/image/${cast.profile_path}`)}')`,
        width: size, height: size,
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        borderRadius: '50%'

      }}></div>
      <Typography variant="body1" sx={{ pt: 1, fontSize: 14, fontWeight: 'bold' }} align="center">
        {cast.name}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontSize: 12 }} align="center">
        {cast.character.replace('(voice)', '').trim()}
      </Typography>
    </div>
  )
}

export default CastCoverCard