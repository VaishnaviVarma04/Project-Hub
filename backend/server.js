const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'project-hub-2-production.up.railway.app'],
  credentials: true
}));
app.use(express.json());

// Routes (we'll add these soon)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

// Connect to MongoDB
console.log('🔄 Attempting to connect to:', process.env.MONGO_URI.split('@')[1] || 'local');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 15000,
})
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ DB Error:', err.message);
    console.error('Code:', err.code);
    process.exit(1);
  });