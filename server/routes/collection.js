const express = require('express');
const Collection = require('../models/Collection');
const Note = require('../models/Note');
const router = express.Router();
const { authenticateApiKey, authenticateToken } = require('./auth');

// Create a new collection
router.post('/collections', authenticateApiKey, authenticateToken, async (req, res) => {
  const { title } = req.body;
  try {
    const collection = new Collection({ userId: req.user.userId, title });
    await collection.save();
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get collections for the signed-in user
router.get('/collections', authenticateApiKey, authenticateToken, async (req, res) => {
  try {
    const collections = await Collection.find({ userId: req.user.userId });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a collection
router.put('/collections/:collectionId', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId } = req.params;
  const { title } = req.body;

  try {
    // Check if the collection belongs to the logged-in user
    const collection = await Collection.findOne({ collectionId, userId: req.user.userId });
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update the collection title
    collection.title = title || collection.title;
    await collection.save();

    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a collection and its associated notes
router.delete('/collections/:collectionId', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId } = req.params;

  try {
    // Check if the collection belongs to the logged-in user
    const collection = await Collection.findOne({ collectionId, userId: req.user.userId });
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete the collection and its notes
    await Note.deleteMany({ collectionId });
    await Collection.deleteOne({ collectionId });

    res.json({ message: 'Collection and associated notes deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new note in a collection
router.post('/collections/:collectionId/notes', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId } = req.params;
  const { content, x, y } = req.body; // Capture the x and y coordinates

  try {
    // Check if the collection belongs to the logged-in user
    const collection = await Collection.findOne({ collectionId, userId: req.user.userId });
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Ensure that x and y coordinates are provided
    if (x === undefined || y === undefined) {
      return res.status(400).json({ message: 'Missing x or y coordinates' });
    }

    // Create a new note with collectionId, content, and coordinates
    const note = new Note({ collectionId, content, x, y });
    await note.save();

    res.json(note); // Return the saved note
    console.log(note);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
    console.log(err);
  }
});


// Get notes in a collection for the signed-in user
router.get('/collections/:collectionId/notes', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId } = req.params;

  try {
    // Check if the collection belongs to the logged-in user
    const collection = await Collection.findOne({ collectionId, userId: req.user.userId });
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const notes = await Note.find({ collectionId });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note (including position)
router.put('/collections/:collectionId/notes/:noteId', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId, noteId } = req.params;
  const { content, x, y } = req.body;

  try {
    const note = await Note.findOne({ noteId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const collection = await Collection.findOne({ collectionId, userId: req.user.userId });
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update the note's content and position
    note.content = content || note.content;
    note.x = x !== undefined ? x : note.x;
    note.y = y !== undefined ? y : note.y;

    await note.save();

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a note
router.delete('/collections/:collectionId/notes/:noteId', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId, noteId } = req.params;

  try {
    const note = await Note.findOne({ noteId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const collection = await Collection.findOne({ collectionId, userId: req.user.userId });
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Note.deleteOne({ noteId });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
