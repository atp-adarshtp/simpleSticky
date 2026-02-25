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
  },
  sharedWith: [{
    userId: {
      type: String,
      ref: 'User'
    },
    email: {
      type: String
    },
    permission: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    },
    invitedBy: {
      type: String,
      ref: 'User'
    }
  }]
});

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
