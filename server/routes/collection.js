const express = require('express');
const Collection = require('../models/Collection');
const Note = require('../models/Note');
const User = require('../models/User');
const { authenticateApiKey, authenticateToken } = require('./auth');

const router = express.Router();

// Create a new collection
router.post('/collections', authenticateApiKey, authenticateToken, async (req, res) => {
  const { title } = req.body;
  try {
    const collection = new Collection({ userId: req.user.userId, title });
    await collection.save();
    res.status(201).json(collection);
  } catch (err) {
    console.error('Error creating collection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get collections owned by the user
router.get('/collections', authenticateApiKey, authenticateToken, async (req, res) => {
  try {
    const collections = await Collection.find({ userId: req.user.userId });
    // Mark these as not shared (owned by user) and add owner info
    const ownCollections = [];
    for (const collection of collections) {
      // Get the owner user information
      const owner = await User.findOne({ userId: collection.userId });
      const collectionWithOwner = collection.toObject();
      collectionWithOwner.isSharedWithMe = false;
      collectionWithOwner.ownerInfo = {
        name: owner?.name,
        email: owner?.email
      };
      ownCollections.push(collectionWithOwner);
    }
    res.json(ownCollections);
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a collection
router.put('/collections/:collectionId', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId } = req.params;
  const { title } = req.body;

  try {
    const collection = await Collection.findOne({ collectionId, userId: req.user.userId });
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    collection.title = title || collection.title;
    await collection.save();

    res.json(collection);
  } catch (err) {
    console.error('Error updating collection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a collection and its associated notes
router.delete('/collections/:collectionId', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId } = req.params;

  try {
    // Only allow deletion if the user owns the collection (not if it's shared with them)
    const collection = await Collection.findOne({ collectionId, userId: req.user.userId });
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Note.deleteMany({ collectionId });
    await Collection.deleteOne({ collectionId });

    res.json({ message: 'Collection and associated notes deleted' });
  } catch (err) {
    console.error('Error deleting collection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new note in a collection
router.post('/collections/:collectionId/notes', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId } = req.params;
  const { content, x, y, pinned = false } = req.body;

  try {
    // Check if the user owns the collection or has it shared with them with write permission
    let collection = await Collection.findOne({ 
      collectionId, 
      userId: req.user.userId 
    });
    
    if (!collection) {
      // Check if the collection is shared with the user
      collection = await Collection.findOne({ 
        collectionId, 
        'sharedWith.userId': req.user.userId,
        'sharedWith.permission': 'write' // Only allow if user has write permission
      });
      
      if (!collection) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    if (x === undefined || y === undefined) {
      return res.status(400).json({ message: 'Missing x or y coordinates' });
    }

    const note = new Note({ collectionId, content, x, y, pinned });
    await note.save();

    res.status(201).json(note);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notes in a collection for the signed-in user
router.get('/collections/:collectionId/notes', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId } = req.params;

  try {
    // Check if the user owns the collection or has it shared with them
    const collection = await Collection.findOne({ 
      $or: [
        { collectionId, userId: req.user.userId }, // User owns the collection
        { collectionId, 'sharedWith.userId': req.user.userId } // Collection is shared with user
      ]
    });
    
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const notes = await Note.find({ collectionId });
    res.json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a note (including position and pin status)
router.put('/collections/:collectionId/notes/:noteId', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId, noteId } = req.params;
  const { content, x, y, pinned } = req.body;

  try {
    const note = await Note.findOne({ noteId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if the user owns the collection or has it shared with them with write permission
    let collection = await Collection.findOne({ 
      collectionId, 
      userId: req.user.userId 
    });
    
    if (!collection) {
      // Check if the collection is shared with the user
      collection = await Collection.findOne({ 
        collectionId, 
        'sharedWith.userId': req.user.userId,
        'sharedWith.permission': 'write' // Only allow if user has write permission
      });
      
      if (!collection) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    // Update only provided fields
    if (content !== undefined) note.content = content;
    if (x !== undefined) note.x = x;
    if (y !== undefined) note.y = y;
    if (pinned !== undefined) note.pinned = pinned;

    await note.save();

    res.json(note);
  } catch (err) {
    console.error('Error updating note:', err);
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

    // Check if the user owns the collection or has it shared with them with write permission
    let collection = await Collection.findOne({ 
      collectionId, 
      userId: req.user.userId 
    });
    
    if (!collection) {
      // Check if the collection is shared with the user
      collection = await Collection.findOne({ 
        collectionId, 
        'sharedWith.userId': req.user.userId,
        'sharedWith.permission': 'write' // Only allow if user has write permission
      });
      
      if (!collection) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    await Note.deleteOne({ noteId });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share a collection with another user by email
router.post('/collections/:collectionId/share', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId } = req.params;
  const { email, permission } = req.body;

  try {
    // Check if the requesting user owns the collection
    const collection = await Collection.findOne({ collectionId, userId: req.user.userId });
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized or collection not found' });
    }

    // Find the user by email
    const userToShareWith = await User.findOne({ email });
    if (!userToShareWith) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Check if already shared with this user
    const alreadyShared = collection.sharedWith.some(share => 
      share.userId.toString() === userToShareWith.userId.toString()
    );
    if (alreadyShared) {
      return res.status(409).json({ message: 'Collection is already shared with this user' });
    }

    // Add the user to the sharedWith array
    collection.sharedWith.push({
      userId: userToShareWith.userId,
      email: userToShareWith.email,
      permission: permission || 'read',
      invitedBy: req.user.userId
    });

    await collection.save();

    res.json({ message: 'Collection shared successfully', collection });
  } catch (err) {
    console.error('Error sharing collection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get collections shared with the user
router.get('/collections/shared', authenticateApiKey, authenticateToken, async (req, res) => {
  try {
    console.log('Fetching collections shared with user:', req.user.userId);
    const collections = await Collection.find({
      'sharedWith.userId': req.user.userId
    }); // Don't populate since userId is a UUID string, not ObjectId
    
    // Manually populate the owner information by finding the user
    const populatedCollections = [];
    for (const collection of collections) {
      // Get the owner user information
      const owner = await User.findOne({ userId: collection.userId });
      const collectionWithOwner = collection.toObject();
      collectionWithOwner.ownerInfo = {
        name: owner?.name,
        email: owner?.email
      };
      populatedCollections.push(collectionWithOwner);
    }
    
    console.log(`Found ${populatedCollections.length} collections shared with user ${req.user.userId}`);
    
    res.json(populatedCollections);
  } catch (err) {
    console.error('Error fetching shared collections:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unshare a collection
router.delete('/collections/:collectionId/unshare/:email', authenticateApiKey, authenticateToken, async (req, res) => {
  const { collectionId, email } = req.params;

  try {
    // Check if the requesting user owns the collection
    const collection = await Collection.findOne({ collectionId, userId: req.user.userId });
    if (!collection) {
      return res.status(403).json({ message: 'Unauthorized or collection not found' });
    }

    // Remove the user from sharedWith array
    collection.sharedWith = collection.sharedWith.filter(
      share => share.email !== email
    );

    await collection.save();

    res.json({ message: 'Collection unshared successfully', collection });
  } catch (err) {
    console.error('Error unsharing collection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
