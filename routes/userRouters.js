const express = require('express')
const router = express.Router()
const { check } = require('express-validator')

const usersController = require('../Contrllers/usersController')

router.post(
  '/signup',
  [
    check('firstName').not().isEmpty(),
    check('lastName').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
)

router.post('/login',  [
  check('email').normalizeEmail().isEmail(),
  check('password').isLength({ min: 6 })
], usersController.login)

module.exports = router
