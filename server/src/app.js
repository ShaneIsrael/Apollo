const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const fs = require('fs')
const WebSocket = require('ws')
const path = require('path')
const logger = require('./logger')
const ENVIRONMENT = process.env.NODE_ENV || 'production'
const config = require('./config')[ENVIRONMENT]

let userConfig
if (ENVIRONMENT === 'production') {
  userConfig = JSON.parse(fs.readFileSync(path.join(path.dirname(process.execPath), 'config.json')))
} else {
  userConfig = require('../config.json')
}

// setup data folders
fs.mkdirSync(path.join(config.appdata, config.imageDir), { recursive: true })
fs.mkdirSync(path.join(config.appdata, config.logsDir), { recursive: true })


const app = express()

app.use(compression({ filter: shouldCompress }))
function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
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
if (ENVIRONMENT !== 'development') {
  app.use(
    morgan('combined', {
      skip(req, res) {
        return res.statusCode >= 500
      },
      stream: logger.stream,
    }),
  )
}

var whitelist = userConfig.ALLOWED_DOMAINS.split(',')
console.log('------ CORS WHITELIST ------')
console.log(whitelist)
console.log('------ CORS WHITELIST ------')

app.use(bodyParser.json())
if (ENVIRONMENT === 'development') {
  app.use(cors())
} else {
  app.use(cors({
    origin: whitelist
  }))
}

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
const port = ENVIRONMENT === 'development' ? 3001 : userConfig.SERVER_PORT
console.log(`Apollo is running at http://localhost:${port}`)

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
if (ENVIRONMENT === 'production') {
  app.use('/', express.static(path.join(__dirname, '../../ui/build')))
}

// Run Migrations
const { Sequelize } = require('sequelize')
const { Umzug, SequelizeStorage } = require('umzug')
const dbconfig = require('./database/config/config.js')[ENVIRONMENT]
dbconfig.storage = path.join(config.appdata, config.dbname)

const sequelize = new Sequelize(dbconfig)

const umzug = new Umzug({
  migrations: {
    glob: __dirname + '/database/migrations/*.js',
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

// race condition here needs to be solved. Need to run migrations before we start listening on port.
umzug.up().then(() => {
  if (ENVIRONMENT === 'production') {
    let start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
    require('child_process').exec(start + ' ' + `http://localhost:${port}`)
  }
  // RUN SETUP
  require('./utils/checkConfigFlags')
}).catch(err => console.error('An error occurred while trying to update the database', err))

// routes
require('./routes/Library')(app)
require('./routes/Misc')(app)
require('./routes/Series')(app)
require('./routes/Movie')(app)
require('./routes/Stats')(app)
require('./routes/Config')(app)
require('./cron').start()
