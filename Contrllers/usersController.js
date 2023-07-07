const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const HttpError = require('../models/http-error')
const User = require('../models/usersModule')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  const { firstName, lastName, email, password } = req.body

  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    )
    return next(error)
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    )
    return next(error)
  }

  let hashPassword
  try {
    hashPassword = await bcrypt.hash(password, 12)
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Could not create a User. problem in  user',
      500
    )
    return next(error)
  }
  const createdUser = new User({
    firstName,
    lastName,
    email,
    password: hashPassword,
    lists: []
  })

  try {
    await createdUser.save()
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later :-(',
      500
    )
    return next(error)
  }

  let token
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: '30d' }
    )
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    )
    return next(error)
  }
  res
    .status(201)
    .json({
      userId: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      token: token
    })
  //.json({ user: createdUser.toObject({ getters: true }), token: token })
}

exports.login = async (req, res, next) => {
  const { email, password } = req.body

  let existingUser

  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      'Loggin in failed, please try again later.',
      500
    )
    return next(error)
  }

  if (!existingUser) {
    const error = new HttpError('User Dont exist, please signup.', 401)
    return next(error)
  }
  let isValidPassword
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Could not log you in. problem with credentials',
      500
    )
    return next(error)
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    )
    return next(error)
  }

  let token
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: '30d' }
    )
  } catch (err) {
    const error = new HttpError('login failed, please try again later.', 500)
    return next(error)
  }

  res.json({
    userId: existingUser.id,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
    token: token
  })
}
