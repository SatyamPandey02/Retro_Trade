require('dotenv').config();

// Add this debugging section
console.log('=== STARTUP CONFIGURATION ===');
console.log('Current working directory:', process.cwd());
console.log('Environment variables loaded:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);

// Load environment variables first
const path = require('path');
const dotenv = require('dotenv');
const result = dotenv.config({ path: path.join(__dirname, '.env') });

if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

// Verify environment variables
if (!process.env.jwt_secret) {
    console.error('JWT_SECRET is not configured in .env file');
    process.exit(1);
}

const express = require('express');
const app = express();
require('dotenv').config({ path: __dirname + '/.env' });

// Debug log to verify environment variables
console.log('Environment variables loaded:', {
    MONGO_URL: process.env.MONGO_URL ? 'Set' : 'Not Set',
    jwt_secret: process.env.jwt_secret ? 'Set' : 'Not Set',
    PORT: process.env.PORT ? 'Set' : 'Not Set'
});

// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Add body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const connectDB = require('./config/dbConfig');
const port = process.env.PORT || 5000;

// Import routes
const usersRoute = require('./routes/usersRoute');
const productsRoute = require('./routes/productsRoute');
const notificationsRoute = require('./routes/notificationsRoute');
const paymentsRoute = require('./routes/paymentsRoute');

// Add this at the start of your server.js
console.log('Server Starting...');
console.log('Razorpay Configuration Check:');
console.log('Key ID:', process.env.RAZORPAY_KEY_ID);
console.log('Secret exists:', !!process.env.RAZORPAY_KEY_SECRET);

// Connect to MongoDB
connectDB().then(() => {
    // Use routes
    app.use('/api/users', usersRoute);
    app.use('/api/products', productsRoute);
    app.use('/api/notifications', notificationsRoute);
    app.use('/api/payments', paymentsRoute);

    // deployment config
    if (process.env.NODE_ENV === "production") {
        const rootPath = path.resolve();
        app.use(express.static(path.join(rootPath, "/client/build")));
        app.get("*", (req, res) => {
            res.sendFile(path.join(rootPath, "client", "build", "index.html"));
        });
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error('Server error:', err);
        res.status(500).send({
            success: false,
            message: err.message || 'Internal server error'
        });
    });

    // Start server
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log('Environment:', process.env.NODE_ENV || 'development');
        console.log('MongoDB URL:', process.env.MONGO_URL);
        console.log('Cloudinary configured:', !!process.env.CLOUDINARY_CLOUD_NAME);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

// Add this to verify MongoDB connection
const mongoose = require("mongoose");
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
mongoose.connection.once('open', () => {
    console.log('MongoDB connected successfully');
});

// Add this line with your other routes
app.use("/api/payments", require("./routes/paymentsRoute"));

// Add this logging to verify environment variables are loaded
console.log("Razorpay Key ID available:", !!process.env.RAZORPAY_KEY_ID);
console.log("Razorpay Secret available:", !!process.env.RAZORPAY_KEY_SECRET);

const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}