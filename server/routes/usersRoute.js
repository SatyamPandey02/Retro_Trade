const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlwares/authMiddleware");
const Product = require("../models/productModel");
const nodemailer = require("nodemailer");
const Bid = require("../models/bidModel");
const Notification = require("../models/notificationsModel");

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify transporter connection
transporter.verify(function(error, success) {
    if (error) {
        console.log("SMTP Connection Error:", error);
    } else {
        console.log("SMTP Server is ready to send emails");
    }
});

// new user registration
router.post("/register", async (req, res) => {
  try {
    // check if user already exists
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      throw new Error("User already exists");
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // save user
    const newUser = new User(req.body);
    await newUser.save();
    res.send({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// user login
router.post("/login", async (req, res) => {
  try {
    // check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found"
      });
    }

    // if user is active
    if (user.status !== "active") {
      return res.status(400).send({
        success: false,
        message: "The user account is blocked, please contact admin"
      });
    }

    // compare password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).send({
        success: false,
        message: "Invalid password"
      });
    }

    // create token
    const token = jwt.sign({ userId: user._id }, process.env.jwt_secret);

    // Add a test notification
    const newNotification = new Notification({
      title: "Welcome to Retro Trade",
      message: "Thank you for logging in. We hope you enjoy your experience!",
      onClick: "/",
      user: user._id,
      read: false,
    });
    await newNotification.save();

    // send response
    res.send({
      success: true,
      message: "User logged in successfully",
      data: token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({
      success: false,
      message: error.message || "Login failed"
    });
  }
});

// get current user
router.get("/get-current-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    res.send({
      success: true,
      message: "User fetched successfully",
      data: user
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).send({
      success: false,
      message: error.message || "Failed to get user data"
    });
  }
});

// get all users
router.get("/get-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.send({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// update user status
router.put("/update-user-status/:id", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.send({
      success: true,
      message: "User status updated successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get user details
router.get("/get-user/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('products')
      .populate('bids')
      .select('-password');

    const soldProducts = await Product.find({
      seller: req.params.id,
      status: "sold"
    });

    const userData = {
      ...user.toObject(),
      soldProducts,
      productsCount: user.products?.length || 0,
      bidsCount: user.bids?.length || 0,
      soldProductsCount: soldProducts.length
    };

    res.send({
      success: true,
      data: userData,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP route with improved error handling
router.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Attempting to send OTP to:", email);

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account exists with this email"
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Generated OTP:", otp); // For debugging

        // Save OTP to user
        user.resetPasswordOTP = otp;
        user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Email configuration
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP - Retro Trade',
            html: `
                <h1>Password Reset Request</h1>
                <p>Your OTP for password reset is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        // Send email with promise
        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Email Error:", error);
                    reject(error);
                } else {
                    console.log("Email sent:", info.response);
                    resolve(info);
                }
            });
        });

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email successfully",
            otp: otp // Remove in production
        });

    } catch (error) {
        console.error("Send OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error sending OTP: " + error.message
        });
    }
});

// Verify OTP and reset password route with improved error handling
router.post("/verify-otp-and-reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Find user with valid OTP
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP fields
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error resetting password"
        });
    }
});

// get user profile data
router.get("/get-user-profile", authMiddleware, async (req, res) => {
  try {
    // Get user data without password
    const user = await User.findById(req.userId)
      .select("-password")
      .lean();

    // Get user's bids
    const bids = await Bid.find({ buyer: req.userId })
      .populate("product")
      .populate("seller")
      .sort({ createdAt: -1 })
      .lean();

    // Get user's products
    const products = await Product.find({ seller: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get received bids (bids on user's products)
    const receivedBids = await Bid.find({ seller: req.userId })
      .populate("product")
      .populate("buyer")
      .sort({ createdAt: -1 })
      .lean();

    res.send({
      success: true,
      data: {
        general: {
          ...user,
          bidsCount: bids.length,
          productsCount: products.length,
          receivedBidsCount: receivedBids.length
        },
        bids,
        products,
        receivedBids
      },
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
