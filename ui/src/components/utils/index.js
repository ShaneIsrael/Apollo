import React from 'react'

export const capitalize = ([firstLetter, ...restOfWord]) => {
  const capitalizedFirstLetter = firstLetter.toUpperCase()
  const restOfWordString = restOfWord.join('')
  return capitalizedFirstLetter + restOfWordString
}

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
  if (Number(window.location.port) === 3000) {
    return `http://${window.location.hostname}:3001${path}`
  }
  return `${window.location.protocol}//${window.location.host}${path}`
}

export function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user && user.accessToken) {
    return { 'x-access-token': user.accessToken }
  } else {
    return {}
  }
}

export function getUser() {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user) {
    return user
  }
  return null
}

export function getLocalConfig() {
  const config = JSON.parse(localStorage.getItem('config'))
  if (config) {
    return config
  }
  return {}
}

export function setLocalConfig(config) {
  localStorage.setItem('config', JSON.stringify(config))
}

export function canDisplayToUser() {
  const config = JSON.parse(localStorage.getItem('config'))
  const user = JSON.parse(localStorage.getItem('user'))

  if (!config) return true
  if (config.enableAdmin) {
    if (!user) return false
    if (user.role !== 'admin') return false
  } else if (config.restrictAccess) {
    if (!user) return false
  }
  return true
}

export function secondsToDhms(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor(seconds % (3600 * 24) / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 60)

  let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
  let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
  let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
  let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
  return (dDisplay + hDisplay + mDisplay).replace(/,\s*$/, "")
}

export function leftOffsetMixin(theme, open) {
  if (!open) {
    return {
      left: `calc(${theme.spacing(7)} + 1px)`,
      [theme.breakpoints.up('sm')]: {
        left: `calc(${theme.spacing(9)} + 1px)`,
      },
    }
  }
  return { left: 240, width: '50%'} 
  // I have no idea why width 50% works but it does. Without it, when the sidebar is open the page gets overflowed and
  // requires you to scroll horizontally. But setting width to 50% seems to make it not overflow.
}
