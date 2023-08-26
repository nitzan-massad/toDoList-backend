const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const List = require('../models/ListModule')
const ListItem = require('../models/ListItemModule')
const HttpError = require('../models/http-error')

exports.addItemToList = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  const { itemTitle, listId } = req.body

  let list
  try {
    list = await List.findById(listId).populate('creator')
  } catch (err) {
    const error = new HttpError('Creating item failed, please try again.', 500)
    return next(error)
  }

  if (!list) {
    const error = new HttpError('Could not find list for provided id.', 404)
    return next(error)
  }
  const newItem = new ListItem({
    itemTitle: itemTitle,
    list
  })
  if (list.creator.id.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this list', 401)
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await newItem.save({ session: sess })
    list.items.push(newItem)
    await list.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    console.log(err)
    const error = new HttpError('Creating item failed, please try again.', 500)
    return next(error)
  }

  const newItemResponse = newItem.toObject()
  delete newItemResponse.list
  newItemResponse.id = newItem._id
  res.status(201).json({ newItemResponse })
}

exports.markAnItemAsCompletedOrNot = async (req, res, next) => {
  // console.log('nit'+JSON.stringify(req.body))
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  const { itemId, checkUncheckBool } = req.body

  let item
  try {
    item = await ListItem.findById(itemId).populate('list')
  } catch (err) {
    const error = new HttpError('Creating item failed, please try again.', 500)
    return next(error)
  }

  if (!item) {
    const error = new HttpError('Could not find item for provided id.', 404)
    return next(error)
  }

  if (item.list.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this list', 401)
    return next(error)
  }

  if (checkUncheckBool) {
    item.completedDate = Date.now()
  } else {
    item.completedDate = null
  }
  item.isDone = checkUncheckBool ?? false

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await item.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    console.log(err)
    const error = new HttpError('updating item failed, please try again.', 500)
    return next(error)
  }

  const itemResponse = item.toObject()
  delete itemResponse.list
  res.status(201).json({ itemResponse })
}

exports.editItemTitle = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  const { itemId, newItemTitle } = req.body

  let item
  try {
    item = await ListItem.findById(itemId).populate('list')
  } catch (err) {
    const error = new HttpError('Creating item failed, please try again.', 500)
    return next(error)
  }

  if (!item) {
    const error = new HttpError('Could not find item for provided id.', 404)
    return next(error)
  }

  if (item.list.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this list', 401)
    return next(error)
  }

  item.itemTitle = newItemTitle

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await item.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    console.log(err)
    const error = new HttpError('updating item failed, please try again.', 500)
    return next(error)
  }

  const itemResponse = item.toObject()
  delete itemResponse.list
  res.status(201).json({ itemResponse })
}

exports.deleteItem = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  const itemId = req.params.itemId
  let item
  try {
    item = await ListItem.findById(itemId).populate('list')
  } catch (err) {
    const error = new HttpError('Creating item failed, please try again.', 500)
    return next(error)
  }

  if (!item) {
    const error = new HttpError('Could not find item for this id.', 404)
    return next(error)
  }

  if (item.list.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this list', 401)
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await item.deleteOne({ session: sess })
    item.list.items.pull(item)
    await item.list.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    )
    return next(error)
  }

  res.status(200).json({ message: 'Deleted place.' })
}
