const express = require('express')
const router = express.Router()
const { check } = require('express-validator')

const itemController = require('../Contrllers/itemController')

router.post(
  '/add-item-to-list',
  [check('itemTitle').not().isEmpty(), check('listId').not().isEmpty()],
  itemController.addItemToList
)

router.patch(
  '/item-check-uncheck',
  [check('itemId').not().isEmpty()],
  itemController.markAnItemAsCompletedOrNot
)

module.exports = router
