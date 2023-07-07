const mongoose = require('mongoose')

const Schema = mongoose.Schema

const listSchema = new Schema({
  listTitle: { type: String, required: true },
  description: { type: String, required: false },
  color: { type: String, default: 'none', required: false },
  items: [{ type: mongoose.Types.ObjectId, required: false, ref: 'ListItem' }],
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
})

module.exports = mongoose.model('List', listSchema)
