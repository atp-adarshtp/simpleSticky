const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Remove deprecated options
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use(express.json());

const { router: authRoutes } = require('./routes/auth');
const collectionRoutes = require('./routes/collection');
app.use('/api/auth', authRoutes);
app.use('/api', collectionRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});