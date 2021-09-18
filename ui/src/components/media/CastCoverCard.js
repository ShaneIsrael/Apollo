import React from 'react'
import { Box, Avatar, Tooltip } from '@mui/material'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { getImagePath } from '../utils'


const CastCoverCard = (props) => {
  const { cast, size } = props

  let character = cast.roles ? cast.roles.sort((a, b) => a.episode_count < b.episode_count)[0].character : cast.character
  character = character.replace('(voice)', '').trim()
  const characterLength = 30
  const modifiedCharacter = character.slice(0, characterLength)
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
      <Tooltip title={character} placement="bottom" arrow>
        <Typography noWrap variant="subtitle2" sx={{ fontSize: 12, width: '100%'}} align="center">
          {character.length > modifiedCharacter.length ? `${modifiedCharacter}...` : modifiedCharacter}
        </Typography>
      </Tooltip>
    </div>
  )
}

export default CastCoverCard