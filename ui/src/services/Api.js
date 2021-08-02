/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios'

const HOSTNAME = window.location.href
// const BASE = window.location.origin
const URL = HOSTNAME.indexOf('localhost') === -1 ? `http://shaneisrael.net:1338`: 'http://localhost:3001'
export default () => {  
  return axios.create({
    baseURL: URL
  })
}