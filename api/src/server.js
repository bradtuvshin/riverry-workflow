const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const shopifyRoutes = require('./routes/shopify');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: ['https://renewed-nature-production.up.railway.app', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/shopify', shopifyRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Riverry Workflow API',
    version: '1.0.0',
    status: 'running'
  });
});

// Setup endpoint to create demo accounts
app.get('/setup-demo', async (req, res) => {
  try {
    const User = require('./models/User');
    
    // Create artist demo account
    const artistExists = await User.findOne({ email: 'artist@riverry.com' });
    if (!artistExists) {
      const artist = new User({
        email: 'artist@riverry.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'Artist',
        role: 'artist'
      });
      await artist.save();
    }
    
    // Create admin demo account
    const adminExists = await User.findOne({ email: 'admin@riverry.com' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@riverry.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'Admin',
        role: 'admin'
      });
      await admin.save();
    }
    
    res.json({ success: true, message: 'Demo accounts created!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
