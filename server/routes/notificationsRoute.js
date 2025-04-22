const router = require("express").Router();
const authMiddleware = require("../middlwares/authMiddleware");
const Notification = require("../models/notificationsModel");

// add a notification
router.post("/notify", authMiddleware, async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      user: req.user._id
    };
    const newNotification = new Notification(notificationData);
    await newNotification.save();
    res.send({
      success: true,
      message: "Notification added successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get all notifications by user
router.get("/get-all-notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });
    res.send({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// delete a notification
router.delete("/delete-notification/:id", authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.send({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// read all notifications by user
router.put("/read-all-notifications", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.send({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
