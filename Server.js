const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ==================== SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [{ street: String, city: String, zipcode: String, default: Boolean }],
  wishlist: [mongoose.Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now }
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  category: { type: String, enum: ['Medicines', 'Vitamins', 'Personal Care', 'Baby Care', 'Medical Devices'] },
  price: Number,
  dosage: String,
  brand: String,
  stock: Number,
  image: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  items: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number, price: Number }],
  totalPrice: Number,
  status: { type: String, enum: ['pending', 'approved', 'shipped', 'delivered'], default: 'pending' },
  prescriptionRequired: Boolean,
  prescriptionFile: String,
  prescriptionStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  deliveryAddress: String,
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// ==================== AUTHENTICATION ====================

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    res.json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret123', { expiresIn: '24h' });
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret123', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  });
};

// ==================== CUSTOMER ROUTES ====================

// Get User Profile
app.get('/api/customer/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Addresses
app.post('/api/customer/addresses', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { addresses: req.body }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add to Wishlist
app.post('/api/customer/wishlist', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { wishlist: req.body.productId } },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Order History
app.get('/api/customer/orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== PRODUCT ROUTES ====================

// Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }
    
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ORDER ROUTES ====================

// Create Order
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { items, totalPrice, prescriptionRequired, prescriptionFile, deliveryAddress } = req.body;
    
    const order = new Order({
      userId: req.userId,
      items,
      totalPrice,
      prescriptionRequired,
      prescriptionFile,
      deliveryAddress,
      prescriptionStatus: prescriptionRequired ? 'pending' : 'approved'
    });
    
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// Admin Middleware
const verifyAdmin = (req, res, next) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Add Product
app.post('/api/admin/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Product
app.put('/api/admin/products/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Product
app.delete('/api/admin/products/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Orders (Admin)
app.get('/api/admin/orders', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').populate('items.productId');
    res.json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update Order Status
app.put('/api/admin/orders/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Review Prescription
app.put('/api/admin/orders/:id/prescription', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { prescriptionStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { prescriptionStatus, status: prescriptionStatus === 'approved' ? 'approved' : 'pending' },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Dashboard Stats (Admin)
app.get('/api/admin/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const pendingPrescriptions = await Order.countDocuments({ prescriptionStatus: 'pending' });
    
    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers,
      pendingPrescriptions
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});