const router = require("express").Router();
const authMiddleware = require("../middlwares/authMiddleware");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Notification = require("../models/notificationsModel");
const User = require("../models/userModel");
const nodemailer = require('nodemailer');

// Add immediate debugging
console.log('=== PAYMENTS ROUTE INITIALIZATION ===');
console.log('Loading with Key ID:', process.env.RAZORPAY_KEY_ID);

// Add debugging logs
console.log('Environment Variables Check:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);

// Log the configuration
console.log("Current Razorpay Config:", {
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET?.slice(0, 4) + '...' // Only log first 4 chars of secret
});

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create email transporter with detailed logging
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    debug: true, // Enable debug logging
    logger: true  // Enable logger
});

// Test email configuration on server start
transporter.verify(function(error, success) {
    if (error) {
        console.error('Email Configuration Error:', error);
    } else {
        console.log('Email server is ready to send emails');
    }
});

// Helper function to send email with proper error handling
const sendEmail = async (mailOptions) => {
    try {
        console.log('Attempting to send email to:', mailOptions.to);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return { success: true, info };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

// Create order endpoint with enhanced error handling
router.post("/create-order", authMiddleware, async (req, res) => {
    try {
        const { productId } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        // Create shorter receipt ID (must be <= 40 chars)
        const shortReceiptId = `rcpt_${Date.now().toString().slice(-8)}_${productId.slice(-4)}`;

        const options = {
            amount: Math.round(product.price * 100), // amount in paise
            currency: "INR",
            receipt: shortReceiptId // This will now be under 40 chars
        };

        console.log("Creating order with options:", options);
        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            data: {
                orderId: order.id,
                amount: product.price,
                currency: "INR",
                productName: product.name
            }
        });
    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({
            success: false,
            message: error?.error?.description || error.message || "Failed to create order"
        });
    }
});

// Verify payment and update order status
router.post("/verify-payment", authMiddleware, async (req, res) => {
    try {
        console.log('Payment verification started');
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            productId,
            userId
        } = req.body;

        // Verify payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            console.log('Payment signature verified');

            // Get product and user details
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error('Product not found');
            }
            console.log('Product found:', product.name);

            const seller = await User.findById(product.seller);
            if (!seller) {
                throw new Error('Seller not found');
            }
            console.log('Seller found:', seller.email);

            const buyer = await User.findById(userId);
            if (!buyer) {
                throw new Error('Buyer not found');
            }
            console.log('Buyer found:', buyer.email);

            // Create order record
            const order = new Order({
                product: productId,
                buyer: userId,
                seller: product.seller,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                amount: product.price,
                status: "success"
            });
            await order.save();
            console.log('Order created:', order._id);

            // Update product status
            await Product.findByIdAndUpdate(productId, { status: "sold" });
            console.log('Product status updated to sold');

            // Create notification for seller
            const newNotification = new Notification({
                user: product.seller,
                title: "Product Sold",
                message: `Your product ${product.name} has been sold for ₹${product.price}`,
                onClick: `/profile`,
                read: false
            });
            await newNotification.save();
            console.log('Seller notification created');

            // Prepare email content
            const mailOptions = {
                from: {
                    name: 'Retro Trade',
                    address: process.env.EMAIL_USER
                },
                to: buyer.email,
                subject: 'Order Confirmation - Retro Trade',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #2c3e50; text-align: center;">Payment Successful!</h1>
                        <h2 style="color: #27ae60; text-align: center;">Congratulations on your purchase!</h2>
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #2c3e50;">Order Details:</h3>
                            <p><strong>Product:</strong> ${product.name}</p>
                            <p><strong>Amount Paid:</strong> ₹${product.price}</p>
                            <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
                            <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                        </div>
                        <p style="text-align: center; color: #7f8c8d;">
                            You will receive your product within 48 working hours.
                        </p>
                        <p style="text-align: center; color: #7f8c8d;">
                            Thank you for shopping with Retro Trade!
                        </p>
                    </div>
                `
            };

            // Send email with error handling
            try {
                console.log('Attempting to send confirmation email to:', buyer.email);
                await sendEmail(mailOptions);
                console.log('Confirmation email sent successfully');
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
                // Don't throw error here, continue with the response
            }

            res.status(200).json({
                success: true,
                message: "Payment verified and order created successfully"
            });
        } else {
            console.error('Invalid payment signature');
            res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user orders
router.get("/get-orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ buyer: req.userId }, { seller: req.userId }]
        })
            .populate("product")
            .populate("buyer", "name")
            .populate("seller", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add this test route
router.get("/test-razorpay", async (req, res) => {
    try {
        const response = await razorpay.orders.create({
            amount: 100,
            currency: "INR",
            receipt: "test_receipt"
        });
        res.json({ success: true, data: response });
    } catch (error) {
        res.json({ 
            success: false, 
            error: error.message,
            details: {
                keyId: process.env.RAZORPAY_KEY_ID ? "Present" : "Missing",
                secretKey: process.env.RAZORPAY_KEY_SECRET ? "Present" : "Missing"
            }
        });
    }
});

// Test route
router.get("/test-connection", async (req, res) => {
    try {
        // Try to create a small test order
        const testOrder = await razorpay.orders.create({
            amount: 100,
            currency: "INR",
            receipt: "test_connection_" + Date.now()
        });
        
        res.json({
            success: true,
            message: "Razorpay connection successful",
            testOrder: testOrder,
            configuredKeyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            configuredKeyId: process.env.RAZORPAY_KEY_ID,
            errorDetails: error
        });
    }
});

// Add a test route to verify configuration
router.get("/verify-config", (req, res) => {
    res.json({
        success: true,
        config: {
            keyId: process.env.RAZORPAY_KEY_ID,
            hasSecret: !!process.env.RAZORPAY_KEY_SECRET
        }
    });
});

// Test email route
router.post("/test-email", authMiddleware, async (req, res) => {
    try {
        const testMailOptions = {
            from: {
                name: 'Retro Trade',
                address: process.env.EMAIL_USER
            },
            to: req.body.email,
            subject: 'Test Email from Retro Trade',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2c3e50; text-align: center;">Test Email</h1>
                    <p style="text-align: center; color: #7f8c8d;">
                        This is a test email from Retro Trade to verify email functionality.
                    </p>
                </div>
            `
        };

        await sendEmail(testMailOptions);
        res.status(200).json({
            success: true,
            message: "Test email sent successfully"
        });
    } catch (error) {
        console.error("Test email error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 