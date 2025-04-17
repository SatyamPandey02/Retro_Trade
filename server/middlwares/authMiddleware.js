const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token, process.env.jwt_secret);
    if (!decoded.userId) {
      throw new Error("Invalid token");
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Set the user ID in the request
    req.userId = user._id;
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).send({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};
