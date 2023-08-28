const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ListItemSchema = new Schema({
  itemTitle: { type: String, required: true },
  description: { type: String, required: false },
  creationDate: { type: Date, default: Date.now },
  completedDate: { type: Date, required: false },
  isDone: { type: Boolean, default: false } ,
  creator: {type: mongoose.Types.ObjectId, required: true ,ref: 'User'},
  list: { type: mongoose.Types.ObjectId, required: true, ref: 'List' }
})

module.exports = mongoose.model('ListItem', ListItemSchema)
