const express = require('express')
const router = express.Router()
const { check } = require('express-validator')

const listController = require('../Contrllers/ListController')

router.post('/get-all-user-lists/', listController.getAllUserLists)
router.post(
  '/add-list-to-user',
  [check('listTitle').not().isEmpty()],
  listController.postCreateList
)

router.patch(
  '/update-list-color/:lid',
  [check('color').not().isEmpty()],
  listController.updateListColor
)

router.post(
  '/add-item-to-list',
  [check('itemTitle').not().isEmpty(), check('listId').not().isEmpty()],
  listController.addItemToList
)

router.delete('/delete-list/:lid', listController.deleteList)

module.exports = router
