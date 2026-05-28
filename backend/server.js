// MOPHIX STUDIO - MAIN SERVER FILE
// Backend API Entry Point

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
require('express-async-errors');

// Load environment variables
dotenv.config();

// Import database connection
const sequelize = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/users.routes');
const servicesRoutes = require('./src/routes/services.routes');
const galleriesRoutes = require('./src/routes/galleries.routes');
const photosRoutes = require('./src/routes/photos.routes');
const bookingsRoutes = require('./src/routes/bookings.routes');
const testimonialsRoutes = require('./src/routes/testimonials.routes');
const contactRoutes = require('./src/routes/contact.routes');
const blogRoutes = require('./src/routes/blog.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const aiRoutes = require('./src/routes/ai.routes');

// Import middleware
const { errorHandler } = require('./src/middleware/errorHandler');
const { requestLogger } = require('./src/middleware/logger');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true
}));
app.use(requestLogger);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Mophix Studio API is running' });
});

// API Routes
const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/services`, servicesRoutes);
app.use(`${apiPrefix}/galleries`, galleriesRoutes);
app.use(`${apiPrefix}/photos`, photosRoutes);
app.use(`${apiPrefix}/bookings`, bookingsRoutes);
app.use(`${apiPrefix}/testimonials`, testimonialsRoutes);
app.use(`${apiPrefix}/contact`, contactRoutes);
app.use(`${apiPrefix}/blog`, blogRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Global Error Handler
app.use(errorHandler);

// Database connection and server startup
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✓ Database connection established successfully');

        // Sync models
        // NOTE: sequelize.sync({ alter: true }) can generate many FK/index operations and may hit
        // MySQL limitations (e.g., max keys). For local dev, avoid alter and let migrations/seed handle changes.
        await sequelize.sync({ alter: false });
        console.log('✓ Database models synchronized (no alter)');


        // Start server
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════╗
║   MOPHIX STUDIO - Backend API Server          ║
╠════════════════════════════════════════════════╣
║ Environment: ${process.env.NODE_ENV || 'development'.padEnd(21)} ║
║ Port: ${PORT.toString().padEnd(33)} ║
║ API Version: ${process.env.API_VERSION || 'v1'.padEnd(29)} ║
╚════════════════════════════════════════════════╝
            `);
            console.log(`→ Server running on http://${process.env.HOST || 'localhost'}:${PORT}`);
            console.log(`→ API available at http://${process.env.HOST || 'localhost'}:${PORT}${apiPrefix}`);
            console.log(`→ Health check: http://${process.env.HOST || 'localhost'}:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('✗ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('✗ Unhandled Rejection:', err);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
