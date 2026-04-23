const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const itemRoutes = require('./src/routes/items');

const app = express();

// ── CORS — allow all origins (Vercel, localhost, etc.) ──────────────────────
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle pre-flight requests

// Middleware
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/items', itemRoutes);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Lost & Found Management System API is running' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
