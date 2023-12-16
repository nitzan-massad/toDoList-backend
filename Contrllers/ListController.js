const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

const List = require('../models/ListModule')
const ListItem = require('../models/ListItemModule')
const User = require('../models/usersModule')
const HttpError = require('../models/http-error')
const authorizationUtils = require('../Utils/authorizationUtils')

exports.postCreateList = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  const { listTitle, color } = req.body

  const createdList = new List({
    listTitle,
    creator: req.userData.userId,
    color: color
  })

  let user
  try {
    user = await User.findById(req.userData.userId)
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again.', 500)
    return next(error)
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404)
    return next(error)
  }

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await createdList.save({ session: sess })
    user.lists.push(createdList)
    await user.save({ session: sess })
    await sess.commitTransaction()
  } catch (err) {
    console.log(err)
    const error = new HttpError('Creating list failed, please try again.', 500)
    return next(error)
  }

  res.status(201).json({ createdList })
}

exports.getAllUserLists = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  try {
    userWithLists = await User.findById(req.userData.userId)
      .populate({
        path: 'lists',
        populate: { path: 'items' }
      })
      .populate({
        path: 'contributorOn',
        populate: { path: 'items' }
      })
  } catch (err) {
    console.log(err)
    const error = new HttpError(
      'Fetching lists failed, please try again later.',
      500
    )
    return next(error)
  }
  if (!userWithLists) {
    return next(
      new HttpError('Could not find lists for the provided user id.', 404)
    )
  }
  res.json({
    lists: userWithLists.lists.map(list => list.toObject({ getters: true })),
    contributorOn: userWithLists.contributorOn.map(list => list.toObject({ getters: true }))
  })
}

exports.addItemToList = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  const { itemTitle, listId } = req.body

  let list =await authorizationUtils.listPopulateAndAutorizationUse(listId,req.userData.userId,next)

  const newItem = new ListItem({
    itemTitle: itemTitle,
    list,
    creator:req.userData.userId
  })

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

exports.updateListColor = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    )
  }
  const { color } = req.body
  const listId = req.params.lid

  let list = await authorizationUtils.listPopulateAndAutorizationUse(
    listId,
    req.userData.userId,
    next
  )

  list.color = color
  try {
    await list.save()
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update List.',
      500
    )
    return next(error)
  }

  res.status(200).json({ list: list.toObject({ getters: true }) })
}

exports.deleteList = async (req, res, next) => {
  const listId = req.params.lid

  let list = await authorizationUtils.listPopulateAndAutorizationUse(
    listId,
    req.userData.userId,
    next
  )

  try {
    const sess = await mongoose.startSession()
    sess.startTransaction()
    await list.deleteOne({ session: sess })
    const ItemModel = mongoose.model('ListItem')
    await ItemModel.deleteMany({ _id: { $in: list.items } }).session(sess)
    list.creator.lists.pull(list)
    await list.creator.save({ session: sess })
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
