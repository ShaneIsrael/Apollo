import React from 'react'

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export const debounce = (callback, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => callback(...args), delay)
  }
}

export function useInterval(callback, delay) {
  const savedCallback = React.useRef()
  
  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  
  React.useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => {
        clearInterval(id)
      }
    }
  }, [callback, delay])
}

export function getImagePath(path) {
  if (window.location.port == 3000) {
    return `http://${window.location.hostname}:3001${path}`
  }
  return `${window.location.protocol}//${window.location.host}${path}`
}