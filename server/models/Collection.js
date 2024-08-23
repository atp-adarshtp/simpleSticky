const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const collectionSchema = new mongoose.Schema({
  collectionId: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
