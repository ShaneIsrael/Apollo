import React from 'react'
import { CircularProgress } from '@material-ui/core'

const Loading = (props) => {
  const { size } = props
  return (
    <>
      <CircularProgress size={size} thickness={2.5} color="secondary" />
    </>
  )
}

export default Loading