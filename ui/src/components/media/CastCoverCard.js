import React from 'react'
import { Box, Avatar } from '@mui/material'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { getImagePath } from '../utils'


const CastCoverCard = (props) => {
  const { cast, size } = props

  const character = cast.roles ? cast.roles[0].character : cast.character
  return (
    <div style={{ marginRight: 25, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Avatar alt={character} sx={{
        width: size, height: size
      }} src={getImagePath(`/api/v1/image/${cast.profile_path}`)} />
      {/* <div style={{
        backgroundImage: `url('${getImagePath(`/api/v1/image/${cast.profile_path}`)}')`,
        width: size, height: size,
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        borderRadius: '50%'

      }}></div> */}
      <Typography variant="body1" sx={{ pt: 1, fontSize: 14, fontWeight: 'bold', width: 'max-content' }} align="center">
        {cast.name}
      </Typography>
      <Typography noWrap variant="subtitle2" sx={{ fontSize: 12, width: '100%'}} align="center">
        {character.replace('(voice)', '').trim()}
      </Typography>
    </div>
  )
}

export default CastCoverCard