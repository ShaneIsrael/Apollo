import React from 'react'
import { CircularProgress } from '@material-ui/core'

const Loading = (props) => {
  const { disableShrink, size } = props
  return (
    <>
      <CircularProgress disableShrink={disableShrink} size={size} thickness={2.5} color="secondary" />
    </>
  )
}

export default Loading