const mongoose = require("mongoose");
require('dotenv').config({ path: __dirname + '/../.env' });

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URL:', process.env.MONGO_URL);

    // Set connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    console.log('Connection options:', options);
    
    const connection = await mongoose.connect(process.env.MONGO_URL, options);
    console.log('Mongoose connection established');

    // Get the default connection
    const db = mongoose.connection;

    // Bind connection to error event
    db.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    // Bind connection to open event
    db.once('open', function() {
      console.log("MongoDB connected successfully");
      console.log("Database name:", db.name);
      console.log("Host:", db.host);
      console.log("Port:", db.port);
    });

    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Export the connection
module.exports = connectDB;