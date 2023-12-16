const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const List = require('../models/ListModule')
const ListItem = require('../models/ListItemModule')
const HttpError = require('../models/http-error')
const authorizationUtils = require('../Utils/authorizationUtils')

exports.markAnItemAsCompletedOrNot = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  const { itemId, checkUncheckBool } = req.body

  let item =await authorizationUtils.itemPopulateAndAutorizationUse(itemId,req.userData.userId,next)
 
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

  let item =await authorizationUtils.itemPopulateAndAutorizationUse(itemId,req.userData.userId,next)
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
  let item =await authorizationUtils.itemPopulateAndAutorizationUse(itemId,req.userData.userId,next)
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
