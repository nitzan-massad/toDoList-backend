const express = require('express')
const router = express.Router()
const { check } = require('express-validator')

const itemController = require('../Contrllers/itemController')


router.patch(
  '/item-check-uncheck',
  [check('itemId').not().isEmpty()],
  itemController.markAnItemAsCompletedOrNot
)

router.patch(
  '/edit-item-title',
  [check('itemId').not().isEmpty()],
  itemController.editItemTitle
)
router.delete('/delete-item/:itemId', itemController.deleteItem)

module.exports = router
