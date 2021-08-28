const fs = require('fs')
const path = require('path')
const jwt = require("jsonwebtoken");
const { User, Config } = require('../database/models');
const logger = require('../logger');

const ENVIRONMENT = process.env.NODE_ENV || 'production'
let userConfig
if (ENVIRONMENT === 'production') {
  userConfig = JSON.parse(fs.readFileSync(path.join(path.dirname(process.execPath), 'config.json')))
} else {
  userConfig = require('../../config.json')
}

const TOKEN_KEY = userConfig.TOKEN_KEY

const verifyAdmin = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"]

  try {
    const config = await Config.findOne({ order: [['createdAt', 'DESC']] })
    if (!config || !config.enableAdmin) {
      return next()
    }
    if (!token) {
      return res.status(403).send("A token is required for authentication")
    }

    const decoded = jwt.verify(token, TOKEN_KEY)
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(401).send('Your account does not have the required role for that action.')
    }
    req.user = decoded
    return next()
  } catch (err) {
    logger.warn(err)
    if (ENVIRONMENT === 'development') {
      return res.status(301).redirect('http://localhost:3000')
    }
    return res.status(301).redirect('/')
  }
}

const verifyStandard = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"]

  try {
    const config = await Config.findOne({ order: [['createdAt', 'DESC']] })
    if (!config || !config.restrictAccess) {
      return next()
    }
    if (!token) {
      return res.status(403).send("A token is required for authentication")
    }
    const decoded = jwt.verify(token, TOKEN_KEY)
    req.user = decoded
    return next()
  } catch (err) {
    logger.warn(err)
    if (ENVIRONMENT === 'development') {
      return res.status(301).redirect('http://localhost:3000')
    }
    return res.status(301).redirect('/')
  }
}

module.exports = {
  verifyAdmin,
  verifyStandard
}