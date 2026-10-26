const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize, testAndInitDb } = require('./config/database');
// Import all models to ensure associations are registered
require('./models');

const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { generalApiLimiter } = require('./middlewares/rateLimiter');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const businessProfileRoutes = require('./routes/businessProfileRoutes');
const productRoutes = require('./routes/productRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const salesRoutes = require('./routes/salesRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// 1. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. Strict CORS with Credentials Support
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (origin === CLIENT_ORIGIN || origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Origin not allowed.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Body Parsers with payload limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// 4. Rate Limiting for general endpoints
app.use('/api', generalApiLimiter);

// 5. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'POS Kasir & Stok Backend API is running healthy.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 6. Register Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/business-profile', businessProfileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportRoutes);

// 7. Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Server Bootstrapping Function
async function startServer() {
  try {
    await testAndInitDb();

    // Synchronize models with MySQL (safe schema sync)
    await sequelize.sync();
    console.log('[Sequelize] All database models synchronized successfully.');

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 POS Kasir & Stok Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Allowed Client Origin: ${CLIENT_ORIGIN}`);
      console.log(`====================================================`);
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
