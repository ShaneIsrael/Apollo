const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { serveImage } = require('../controllers')
const { User } = require ('../database/models')
const { verifyAdmin, verifyStandard } = require('../middleware/auth')
const ENVIRONMENT = process.env.NODE_ENV || 'production'
let userConfig
if (ENVIRONMENT === 'production') {
  userConfig = JSON.parse(fs.readFileSync(path.join(path.dirname(process.execPath), 'config.json')))
} else {
  userConfig = require('../../config.json')
}

module.exports = (app) => {
  app.get('/api/v1/image/:id', serveImage)
  
  app.post('/api/v1/register', async (req, res, next) => {
    try {
      const { username, password, role } = req.body

      if (!(username && password && role)) {
        return res.status(400).send('Username, Password and Role is required')
      }

      if (password.length < 5) {
        return res.status(400).send('Password must be at least 5 characters')
      }

      const oldUser = await User.findOne({ where: { username } })

      if (oldUser) {
        return res.status(409).send('User Already Exists')
      }
      if (role === 'admin') {
        const admin = await User.findOne({
          where: { role: 'admin' }
        }) 
        if (admin) return res.status(409).send('Admin account already setup')
      }

      const encryptedPassword = await bcrypt.hash(password, 10)

      const user = await User.create({
        username,
        password: encryptedPassword,
        role: role ? role : 'admin'
      })

      const token = jwt.sign(
        { userId: user.id, username, role},
        userConfig.TOKEN_KEY,
        {
          expiresIn: "12h"
        }
      )
      user.token = token
      user.save()
      return res.status(200).json({
        accessToken: user.token,
        username: user.username,
        role: user.role
      })
    } catch (err) {
      next(err)
    }
  })


  app.post('/api/v1/login', async (req, res, next) => {
    try {
      const { username, password } = req.body
      if (!(username && password)) {
        return res.status(400).send('Username & Password is required')
      }

      const user = await User.findOne({ where: { username }})
      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
          { userId: user.id, username, role: user.role },
          userConfig.TOKEN_KEY,
          {
            expiresIn: "12h",
          }
        )
        
        user.token = token
        user.save()
        return res.status(200).json({
          accessToken: user.token,
          username: user.username,
          role: user.role
        })
      }
      return res.status(400).send('Invalid username or password')
    } catch (err) {
      next(err)
    }
  })

}