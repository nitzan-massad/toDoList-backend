
const List = require('../models/ListModule')
const ListItem = require('../models/ListItemModule')
const HttpError = require('../models/http-error')

exports.isAuthorHavePermissions = (authorId, listCreator,contributors, next) => {
  const contributorIndex = contributors.findIndex(x => x.toString === authorId)
  if (listCreator !== authorId && contributorIndex < 0) {
    const error = new HttpError('You are not allowed to edit this', 401)
    return next(error)
  }
}

exports.itemPopulateAndAutorizationUse = async (itemId, authorId,next) => {
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
  this.isAuthorHavePermissions(item.list.creator.toString(),authorId,item.list.contributors, next)
  return item
}

exports.listPopulateAndAutorizationUse = async (listId, authorId, next) => {
  let list
  try {
    list = await List.findById(listId).populate('creator')
  } catch (err) {
    const error = new HttpError('Action failed, please try again.', 500)
    return next(error)
  }

  if (!list) {
    const error = new HttpError('Could not find list for provided id.', 404)
    return next(error)
  }
  this.isAuthorHavePermissions(list.creator.id.toString(),authorId, list.contributors, next)
  return list
}