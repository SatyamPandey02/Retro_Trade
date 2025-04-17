const cloudinary = require("cloudinary").v2;
require('dotenv').config();

// Debug environment variables
console.log('Current working directory:', process.cwd());
console.log('Environment variables:', {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Present' : 'Missing',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing'
});

// Validate environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  throw new Error('Missing required Cloudinary environment variables');
}

// Configuration
try {
  console.log("Configuring Cloudinary with:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkbkjfaig',
    api_key: process.env.CLOUDINARY_API_KEY || '551636634926348',
    // Don't log the secret key
  });

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkbkjfaig',
    api_key: process.env.CLOUDINARY_API_KEY || '551636634926348',
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Test the connection
  cloudinary.api.ping((error, result) => {
    if (error) {
      console.error('Cloudinary Connection Error:', error);
    } else {
      console.log('Cloudinary Connected Successfully');
    }
  });
} catch (error) {
  console.error('Cloudinary Configuration Error:', error);
  throw new Error("Failed to configure Cloudinary");
}

module.exports = cloudinary;