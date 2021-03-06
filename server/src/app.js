const { existsSync } = require('fs')
const path = require('path')
if (existsSync(path.join(__dirname, '../.env'))) {
  require('dotenv').config({ path: path.join(__dirname, '../.env')})
}
const express = require('express')
const compression = require('compression')
const cors = require('cors')
const morgan = require('morgan')
const fs = require('fs')
const WebSocket = require('ws')
const logger = require('./logger')
const migrations = require('./utils/migrations')
const configFlags = require('./utils/checkConfigFlags')
const ENVIRONMENT = process.env.NODE_ENV || 'production'
const config = require('./config/index.js')[ENVIRONMENT]
const Observer = require('./observer')
const Cache = require('./utils/Cache')

const app = express()
app.set('trust proxy', true)

if (ENVIRONMENT === 'production') {
  app.set('appconfig', JSON.parse(fs.readFileSync(path.join(path.dirname(process.execPath), 'config.json'))))
} else {
  if (ENVIRONMENT === 'docker') {
    let configpath
    if (fs.existsSync('/data/config.json')) {
      configpath = '/data/config.json'
    } else {
      configpath = '/data/config.default.json'
    }
  } else {
    if (fs.existsSync('../config.json')) {
      configpath = '../config.json'
    } else {
      configpath = '../config.default.json'
    }
  }
  app.set('appconfig', require(configpath))
}

const userConfig = app.get('appconfig')

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

function setupDataFolders() {
  // setup data folders
  fs.mkdirSync(path.join(config.appdata, config.imageDir), { recursive: true })
  fs.mkdirSync(path.join(config.appdata, config.logsDir), { recursive: true })
}

function setupMorgan() {
  if (ENVIRONMENT !== 'development') {
    app.use(
      morgan('combined', {
        skip(req, res) {
          return res.statusCode >= 200
        },
        stream: logger.stream,
      }),
    )
  } else {
    app.use(
      morgan('combined', {
        skip(req, res) {
          return res.statusCode >= 500
        },
        stream: logger.stream,
      }),
    )
  }
}

function setupCompression() {
  app.use(compression({ filter: shouldCompress }))
  function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false
    }
    // fallback to standard filter function
    return compression.filter(req, res)
  }
}

function setupCors(whitelist) {
  if (ENVIRONMENT === 'development') {
    app.use(cors())
  } else {
    app.use(cors({
      origin: whitelist
    }))
  }
}

function setupErrorHandler() {
  // Error Handler Middleware
  app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.headers['x-real-ip']} - ${err.stack}`)
    // This will get passed back to the user as a generic server error
    // message for caught errors.
    res.status(err.status || 500).send(err.message || 'Unexpected server error occurred.')
    next()
  })
}

async function preflightChecks() {
  try {
    // run migrations
    await migrations.run(config, ENVIRONMENT)
    // check config flags
    await configFlags.check(userConfig)
  } catch (err) {
    console.error(err)
  }
}

function setupWebsocketServer(server) {
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
}

function setupRoutes() {
    // routes
    require('./routes/Library')(app)
    require('./routes/Misc')(app)
    require('./routes/Series')(app)
    require('./routes/Movie')(app)
    require('./routes/Stats')(app)
    require('./routes/Config')(app)
    require('./cron').start()
}



async function main() {

  setupDataFolders()
  setupMorgan()
  setupCompression()

  app.use(express.json())
  const whitelist = userConfig.ALLOWED_DOMAINS.split(',').map(d => d.trim())

  setupCors(whitelist)
  setupErrorHandler()

  setupRoutes()
  await preflightChecks()

  // Start the server
  const port = ENVIRONMENT === 'development' ? 3001 : ENVIRONMENT === 'docker' ? 6969 : userConfig.SERVER_PORT
  console.log('\n')
  logger.info(`Apollo is running at http://localhost:${ENVIRONMENT === 'docker' ? 6969 : port}`)
  console.log('\n')
  const server = app.listen(port)

  setupWebsocketServer(server)

  if (userConfig.USE_CACHING) {
    const cache = new Cache(ENVIRONMENT === 'development' ? 0 : config.CACHE_TIME_SECONDS || 0)
    app.set('cache', cache)
  }
  const observer = new Observer()
  app.set('observer', observer)

  console.log('-------- CORS WHITELIST --------')
  for (const domain of whitelist) {
    console.log('[', '\x1b[32m', domain, '\x1b[0m', ']')
  }

  // Open browser
  if (ENVIRONMENT === 'production') {
    // serve ui
    app.use('/', express.static(path.join(__dirname, '../../ui/build')))
    // open browser
    let start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open')
    require('child_process').exec(start + ' ' + `http://localhost:${port}`)
  }
  if (ENVIRONMENT === 'docker') {
    // serve ui
    app.use('/', express.static(path.join(__dirname, '../../ui/build')))
  }
}
main()
