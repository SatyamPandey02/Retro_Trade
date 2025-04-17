const router = require("express").Router();
const Product = require("../models/productModel");
const User = require("../models/userModel");
const authMiddleware = require("../middlwares/authMiddleware");
const cloudinary = require("../config/cloudinaryConfig");
const multer = require("multer");
const Notification = require("../models/notificationsModel");
const fs = require('fs');
const path = require('path');
const Bid = require("../models/bidModel");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for temporary storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Add file filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// add a new product
router.post("/add-product", authMiddleware, async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body,
      seller: req.userId,
    });
    await newProduct.save();
    res.send({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get all products
router.post("/get-products", async (req, res) => {
  try {
    const { seller, category = [], age = [], status, search } = req.body;
    let filters = {};

    // Base filters
    if (seller) {
      filters.seller = seller;
    }
    
    // Status filter - can be a single status or an array of statuses
    if (status) {
      if (Array.isArray(status)) {
        filters.status = { $in: status };
      } else {
      filters.status = status;
      }
    }

    // Category filter
    if (category.length > 0) {
      filters.category = { $in: category };
    }

    // Age filter
    if (age.length > 0) {
      const ageFilters = age.map(item => {
        const [fromAge, toAge] = item.split("-").map(Number);
        return {
          age: { $gte: fromAge, $lte: toAge }
        };
      });
      if (ageFilters.length > 0) {
        filters.$or = ageFilters;
      }
    }

    // Search filter
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    const products = await Product.find(filters)
      .populate("seller", "name email")  // Only populate necessary seller fields
      .sort({ createdAt: -1 });

    res.send({
      success: true,
      data: products,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get a product by id
router.get("/get-product-by-id/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller");
    res.send({
      success: true,
      data: product,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// edit a product
router.put("/edit-product/:id", authMiddleware, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.send({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// delete a product
router.delete("/delete-product/:id", authMiddleware, async (req, res) => {
  try {
    // First check if the product exists and belongs to the user
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Verify the product belongs to the user
    if (product.seller.toString() !== req.userId) {
      throw new Error("Unauthorized: You can only delete your own products");
    }

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    res.send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// Update the image upload route
router.post("/upload-image-to-product", authMiddleware, upload.single('file'), async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload to cloudinary with retries
        const uploadToCloudinary = async (retries = 3) => {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "products",
                });
                return result;
            } catch (error) {
                if (retries > 0) {
                    console.log(`Retrying upload... (${retries} attempts left)`);
                    return await uploadToCloudinary(retries - 1);
                }
                throw error;
            }
        };

        const result = await uploadToCloudinary();

        // Clean up - remove the temporary file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Update product with new image URL if productId is provided
        if (req.body.productId) {
            const product = await Product.findById(req.body.productId);
            if (product) {
                product.images = product.images || [];
                product.images.push(result.secure_url);
                await product.save();
            }
        }

        res.json({
        success: true,
            message: "Image uploaded successfully",
            data: result.secure_url,
      });
    } catch (error) {
        // Clean up any uploaded file if there's an error
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        console.error('Image upload error:', error);
        res.status(500).json({
        success: false,
            message: error.message || "Error uploading image"
      });
    }
});

// update product status
router.put("/update-product-status/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
      status,
    });

    // send notification to seller
    const newNotification = new Notification({
      user: updatedProduct.seller,
      message: `Your product ${updatedProduct.name} has been ${status}`,
      title: "Product Status Updated",
      onClick: `/profile`,
      read: false,
    });

    await newNotification.save();
    res.send({
      success: true,
      message: "Product status updated successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// update bid status
router.put("/update-bid-status", authMiddleware, async (req, res) => {
  try {
    const { bidId, status } = req.body;
    const bid = await Bid.findById(bidId);
    
    if (!bid) {
      throw new Error("Bid not found");
    }

    bid.status = status;
    await bid.save();

    // If bid is approved, update product status
    if (status === "approved") {
      const product = await Product.findById(bid.product);
      product.status = "sold";
      await product.save();
    }

    res.send({
      success: true,
      message: "Bid status updated successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get bids for a product
router.get("/get-product-bids/:id", authMiddleware, async (req, res) => {
  try {
    const bids = await Bid.find({ product: req.params.id })
      .populate("buyer")
      .populate("product")
      .sort({ createdAt: -1 });

    res.send({
      success: true,
      data: bids,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
