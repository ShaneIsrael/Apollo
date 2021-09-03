const express = require('express')
const compression = require('compression')
const cors = require('cors')
const morgan = require('morgan')
const fs = require('fs')
const WebSocket = require('ws')
const path = require('path')
const logger = require('./logger')
const migrations = require('./utils/migrations')
const configFlags = require('./utils/checkConfigFlags')
const ENVIRONMENT = process.env.NODE_ENV || 'production'
const config = require('./config')[ENVIRONMENT]
const Observer = require('./observer')
const Cache = require('./utils/Cache')

async function main() {
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

  if (ENVIRONMENT !== 'development') {
    app.use(
      morgan('combined', {
        skip(req, res) {
          return res.statusCode >= 500
        },
        stream: logger.stream,
      }),
    )
  } else {
    app.use(
      morgan('combined', {
        skip(req, res) {
          return res.statusCode >= 200
        },
        stream: logger.stream,
      }),
    )
  }

  var whitelist = userConfig.ALLOWED_DOMAINS.split(',').map(d => d.trim())

  app.use(express.json())
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

  // serve our react build
  if (ENVIRONMENT === 'production') {
    app.use('/', express.static(path.join(__dirname, '../../ui/build')))
  }
  
  // routes
  require('./routes/Library')(app)
  require('./routes/Misc')(app)
  require('./routes/Series')(app)
  require('./routes/Movie')(app)
  require('./routes/Stats')(app)
  require('./routes/Config')(app)
  require('./cron').start()

  try {
    // run migrations
    await migrations.run(config, ENVIRONMENT)
    // check config flags
    await configFlags.check(userConfig)
  } catch (err) {
    console.error(err)
  }

  // Start the server
  const port = ENVIRONMENT === 'development' ? 3001 : userConfig.SERVER_PORT
  console.log('\n')
  logger.info(`Apollo is running at http://localhost:${port}`)
  console.log('\n')

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
  const cache = new Cache(180)
  const observer = new Observer()
  app.set('wss', wss)
  app.set('cache', cache)
  app.set('observer', observer)

  console.log('-------- CORS WHITELIST --------')
  for (const domain of whitelist) {
    console.log('[', '\x1b[32m', domain, '\x1b[0m', ']')
  }

  // Open browser
  if (ENVIRONMENT === 'production') {
    let start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    require('child_process').exec(start + ' ' + `http://localhost:${port}`)
  }
}
main()
