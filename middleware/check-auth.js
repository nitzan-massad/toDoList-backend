const jwt = require('jsonwebtoken')
const HttpError = require('../models/http-error')

module.exports = (req, res, next) => {
  try {
    if (req.method === 'OPTIONS') {
      return next()
    }
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      throw new Error('cant find the token')
    }
    const decodeToken = jwt.verify(token, process.env.JWT_KEY)
    req.userData = { userId: decodeToken.userId }
    next()
  } catch (err) {
    console.log(err)
    const error = new HttpError('authentication failed', 401)
    return next(error)
  }
}
