/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios'

const HOSTNAME = window.location.href
// const BASE = window.location.origin
// const URL = window.location.port == 6969 ? `${window.location.protocol}//${window.location.hostname}:6969`: 'http://localhost:3001'

const URL = window.location.port ? 
  window.location.port == 6969 ? `${window.location.protocol}//${window.location.hostname}:6969` : 'http://localhost:3001'
  : `${window.location.protocol}//${window.location.host}${window.location.pathname}`

console.log(`BASE_URL=${URL}`)
export default () => {  
  return axios.create({
    baseURL: URL
  })
}