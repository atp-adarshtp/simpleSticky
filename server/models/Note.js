const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const noteSchema = new mongoose.Schema({
  noteId: {
    type: String,
    default: uuidv4,
    unique: true
  },
  collectionId: {
    type: String,
    ref: 'Collection',
    required: true
  },
  content: {
    type: String,
     default: ""
  },
  x: {
    type: Number,
    default: 0 // Default position if not specified
  },
  y: {
    type: Number,
    default: 0 // Default position if not specified
  }
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
