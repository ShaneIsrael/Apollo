/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios'
import { authHeader } from '../components/utils'
// const HOSTNAME = window.location.href
// const BASE = window.location.origin
// const URL = window.location.port == 6969 ? `${window.location.protocol}//${window.location.hostname}:6969`: 'http://localhost:3001'

const URL = window.location.port ? 
  Number(window.location.port) === 6969 ? `${window.location.protocol}//${window.location.hostname}:6969` : `http://${window.location.hostname}:3001`
  : `${window.location.protocol}//${window.location.host}${window.location.pathname}`

console.log(`BASE_URL=${URL}`)
export default () => {  
  if (authHeader()['x-access-token']) {
    axios.defaults.headers.common['x-access-token'] = authHeader()['x-access-token']
  }
  return axios.create({
    baseURL: URL,
  })
}