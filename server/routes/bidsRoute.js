const router = require("express").Router();
const Bid = require("../models/bidModel");
const authMiddleware = require("../middlwares/authMiddleware");
const Notification = require("../models/notificationsModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Product = require("../models/productModel");

// place a new bid
router.post("/place-new-bid", authMiddleware, async (req, res) => {
  try {
    const newBid = new Bid(req.body);
    await newBid.save();

    // Send notification to seller about new bid
    const newNotification = new Notification({
      user: req.body.seller,
      title: "New Bid Received",
      message: `You have received a new bid of ₹${req.body.bidAmount} for your product`,
      onClick: `/profile/bids`,
      read: false,
    });
    await newNotification.save();

    res.send({ success: true, message: "Bid placed successfully" });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

// get all bids
router.post("/get-all-bids", authMiddleware, async (req, res) => {
  try {
    const { product, seller } = req.body;
    let filters = {};
    if (product) {
      filters.product = product;
    }
    if (seller) {
      filters.seller = seller;
    }

    const bids = await Bid.find(filters)
      .populate("product")
      .populate("buyer")
      .populate("seller")
      .sort({ createdAt: -1 });
    res.send({ success: true, data: bids });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
});

// update bid status (approve/reject)
router.post("/update-bid-status", authMiddleware, async (req, res) => {
  try {
    const { bidId, status } = req.body;
    const bid = await Bid.findById(bidId)
      .populate("product")
      .populate("buyer")
      .populate("seller");

    if (!bid) {
      throw new Error("Bid not found");
    }

    // Update bid status
    bid.status = status;
    await bid.save();

    // Send notification to buyer about bid status
    const notificationTitle = status === "approved" ? "Bid Approved" : "Bid Rejected";
    const notificationMessage = status === "approved"
      ? `Your bid of ₹${bid.bidAmount} for ${bid.product.name} has been approved. You can now proceed with purchase.`
      : `Your bid of ₹${bid.bidAmount} for ${bid.product.name} has been rejected.`;

    const newNotification = new Notification({
      user: bid.buyer._id,
      title: notificationTitle,
      message: notificationMessage,
      onClick: `/profile/bids`,
      read: false,
    });
    await newNotification.save();

    res.send({
      success: true,
      message: `Bid ${status} successfully`,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// initiate payment
router.post("/initiate-payment", authMiddleware, async (req, res) => {
  try {
    const { bidId } = req.body;
    const bid = await Bid.findById(bidId).populate("product");
    
    if (!bid) {
      throw new Error("Bid not found");
    }

    if (bid.status !== "approved") {
      throw new Error("Bid must be approved before payment");
    }

    // Initialize Razorpay
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create Razorpay order
    const options = {
      amount: bid.bidAmount * 100, // amount in paisa
      currency: "INR",
      receipt: `bid_${bidId}`,
    };

    const order = await instance.orders.create(options);

    // Update bid with order ID
    bid.razorpayOrderId = order.id;
    await bid.save();

    res.send({
      success: true,
      data: {
        orderId: order.id,
        amount: bid.bidAmount * 100,
        currency: "INR",
        bidId: bidId,
      },
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// verify payment
router.post("/verify-payment", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bidId } = req.body;

    // Verify payment signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      throw new Error("Payment verification failed");
    }

    // Update bid and product status
    const bid = await Bid.findById(bidId).populate("product").populate("seller");
    bid.paymentStatus = "completed";
    bid.razorpayPaymentId = razorpay_payment_id;
    bid.status = "completed";
    await bid.save();

    // Update product status
    const product = await Product.findById(bid.product._id);
    product.status = "sold";
    await product.save();

    // Notify seller
    const newNotification = new Notification({
      user: bid.seller._id,
      title: "Payment Received",
      message: `Payment of ₹${bid.bidAmount} received for ${product.name}`,
      onClick: `/profile/bids`,
      read: false,
    });
    await newNotification.save();

    res.send({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;