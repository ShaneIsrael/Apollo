require('dotenv').config()
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const WebSocket = require('ws')
const path = require('path')
const logger = require('./logger')
// const { environment } = require('./config')

const environment = process.env.NODE_ENV

// console.log('Loading db...')
// const { readFileSync } = require('fs')
// const db = JSON.parse(readFileSync(path.resolve(__dirname, 'media.json')))
// console.log('db loaded!')

const app = express()
app.use(compression({ filter: shouldCompress }))
function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    console.log('no compress')
    return false
  }
  // fallback to standard filter function
  return compression.filter(req, res)
}

app.set('trust proxy', true)
app.use(
  morgan('combined', {
    skip(req, res) {
      return res.statusCode >= 400
    },
    stream: logger.stream,
  }),
)
if (environment !== 'dev') {
  app.use(
    morgan('combined', {
      skip(req, res) {
        return res.statusCode >= 500
      },
      stream: logger.stream,
    }),
  )
}


app.use(bodyParser.json())
app.use(cors())
// app.use((req, res, next) => {
//   res.locals.db = db
//   next()
// })

// Error Handler Middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.headers['x-real-ip']} - ${err.stack}`)
  // This will get passed back to the user as a generic server error
  // message for caught errors.
  res.status(err.status || 500).send(err.message || 'Unexpected server error occurred.')
  next()
})

function formatConsoleDate(date) {
  var hour = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var milliseconds = date.getMilliseconds();

  return '[' +
    ((hour < 10) ? '0' + hour : hour) +
    ':' +
    ((minutes < 10) ? '0' + minutes : minutes) +
    ':' +
    ((seconds < 10) ? '0' + seconds : seconds) +
    '] ';
}

// Start the server
const port = process.env.ENVIRONMENT === 'dev' ? 3001 : process.env.SERVER_PORT
console.log(`Listening on port ${port}`)
const server = app.listen(port)
const wss = new WebSocket.Server({ server })
wss.on('connection', ws => {
  ws.on('message', async (message) => {
    wss.broadcast(`${formatConsoleDate(new Date())} ${String(message)}`)
  })
})
wss.broadcast = function broadcast(msg) {
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify({
      timestamp: formatConsoleDate(new Date()),
      message: String(msg)
    }))
  })
}
app.set('wss', wss)

// serve our react build
if (process.env.ENVIRONMENT !== 'dev') {
  app.use('/', express.static(path.join(__dirname, '../../ui/build')))
}
// routes
require('./routes/Library')(app)
require('./routes/Media')(app)
require('./routes/Misc')(app)
require('./routes/Series')(app)
require('./routes/Movie')(app)
require('./routes/Stats')(app)