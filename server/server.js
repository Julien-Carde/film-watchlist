const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Add basic route to test server
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://watchlist-ktw00smxa-julien-cardes-projects.vercel.app',
        'https://watchlist-one-xi.vercel.app/'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Add this before your routes to debug CORS issues
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        origin: req.headers.origin
    });
    next();
});

// MongoDB connection with detailed error logging
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI?.substring(0, 20) + '...'); // Log partial URI for safety

mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas');
    })
    .catch(err => {
        console.error('Detailed MongoDB connection error:', {
            name: err.name,
            message: err.message,
            code: err.code,
            stack: err.stack
        });
        process.exit(1);
    });

// Routes
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');

// Add error handling for route imports
try {
    app.use('/api', authRoutes);
    app.use('/api/watchlist', watchlistRoutes);
} catch (error) {
    console.error('Error setting up routes:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', {
        name: err.name,
        message: err.message,
        stack: err.stack
    });
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server with better error handling
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
}); 