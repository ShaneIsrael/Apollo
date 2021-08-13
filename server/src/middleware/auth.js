const jwt = require("jsonwebtoken");

const TOKEN_KEY = process.env.TOKEN_KEY

const verifyAdmin = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"]

  // check db for config settings
  // if Enable Admin is FALSE
  // return next()
  // else check token and make sure role is admin
  // end configuration check

  if (!token) {
    return res.status(403).send("A token is required for authentication")
  }
  try {
    const decoded = jwt.verify(token, TOKEN_KEY)
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(401).send('Your account does not have the required role for that action.')
    }
    req.user = decoded
    return next()
  } catch (err) {
    return res.status(401).send("Invalid Token")
  }
}

const verifyStandard = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"]

  // check db for config settings
  // if Restrict Access is FALSE
  // return next()
  // else check token
  // end configuration check

  if (!token) {
    return res.status(403).send("A token is required for authentication")
  }
  try {
    const decoded = jwt.verify(token, TOKEN_KEY)
    req.user = decoded
    return next()
  } catch (err) {
    return res.status(401).send("Invalid Token")
  }
}

module.exports = {
  verifyAdmin,
  verifyStandard
}