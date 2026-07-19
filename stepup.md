# PharmaCare - Online Pharmacy Platform
## Setup & Installation Guide

### 📋 Project Overview
Full-stack pharmacy e-commerce platform with customer accounts, product management, order tracking, and prescription approval system.

**Tech Stack:** React + Node.js + MongoDB

---

## ⚙️ Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas cloud)
- Git

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to project folder
cd pharmacy-app

# Install dependencies
npm install

# Required packages:
npm install express mongoose cors dotenv bcryptjs jsonwebtoken

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/pharmacy
JWT_SECRET=your_secret_key_here
PORT=5000
EOF

# Start server
node server.js
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
# Create React app (if starting fresh)
npx create-react-app pharmacy-frontend
cd pharmacy-frontend

# Copy App.jsx and App.css into src/
cp ../App.jsx src/
cp ../App.css src/

# Update src/index.js
cat > src/index.js << EOF
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Start development server
npm start
# App runs on http://localhost:3000
```

### 3. Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# macOS:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB:
brew services start mongodb-community

# OR Windows: Download from https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud)**
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update MONGODB_URI in .env:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pharmacy
```

---

## 📱 Features Implemented

### ✅ Customer Features
- **Authentication**: Sign up, Login, JWT-based sessions
- **Order History**: View all past orders with status tracking
- **Saved Addresses**: Add and manage multiple delivery addresses
- **Wishlist**: Save products for later (UI ready)

### ✅ Admin Features
- **Dashboard**: Real-time stats (orders, revenue, customers, pending prescriptions)
- **Product Management**: Add, Edit, Delete products with categories
- **Order Management**: View all orders, update status
- **Prescription Review**: Approve/Reject prescription uploads
- **Inventory Tracking**: Monitor stock levels

### ✅ Core System
- **Authentication**: Secure JWT tokens
- **Product Catalog**: Filter by category, price, brand
- **Order Processing**: Create orders with prescription support
- **Database Models**: User, Product, Order schemas

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/signup
POST /api/auth/login
```

### Customer Routes (Protected)
```
GET  /api/customer/profile
POST /api/customer/addresses
GET  /api/customer/orders
POST /api/customer/wishlist
```

### Products
```
GET /api/products (with filters: category, brand, minPrice, maxPrice)
GET /api/products/:id
```

### Orders
```
POST /api/orders
```

### Admin Routes (Protected + Admin Role)
```
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id

GET    /api/admin/orders
PUT    /api/admin/orders/:id (update status)
PUT    /api/admin/orders/:id/prescription (review prescription)

GET    /api/admin/stats
```

---

## 🧪 Testing the App

### 1. Create Test Admin User
```bash
# In MongoDB (mongosh or Atlas console):
db.users.insertOne({
  name: "Admin User",
  email: "admin@pharmacy.com",
  password: "$2a$10/...", // bcrypt hash of "admin123"
  role: "admin"
})
```

Or use signup and manually update role to admin in DB.

### 2. Test Workflows

**Customer Flow:**
1. Sign up → Login
2. View Products
3. Create Order
4. Upload Prescription
5. Track Order Status
6. View Order History

**Admin Flow:**
1. Login as admin
2. Add Products
3. View Dashboard Stats
4. Review Orders
5. Approve/Reject Prescriptions
6. Update Order Status

---

## 📦 Project Structure

```
pharmacy-app/
├── server.js              # Express backend with MongoDB models
├── App.jsx                # React frontend with all pages
├── App.css                # Styling (mobile responsive)
├── package.json           # Dependencies
├── .env                   # Environment variables
└── SETUP.md              # This file
```

---

## 🎨 Customization

### Change Color Scheme
Edit CSS variables in `App.css`:
```css
:root {
  --primary: #00b894;      /* Green */
  --secondary: #0984e3;    /* Blue */
  --danger: #d63031;       /* Red */
  /* ... etc */
}
```

### Modify Database Models
Edit schemas in `server.js` and add/update MongoDB models.

### Add Payment Gateway
1. Install Stripe or Razorpay SDK
2. Add payment route in backend
3. Integrate checkout in frontend

### Implement Image Upload
1. Use Multer for file handling
2. Store in AWS S3 or Cloudinary
3. Update Product model with image URLs

---

## 🐛 Troubleshooting

**Issue: MongoDB Connection Error**
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify MONGODB_URI in .env
- Test connection: `mongosh`

**Issue: CORS Error**
- Ensure backend CORS is enabled
- Check frontend API_BASE URL matches backend port

**Issue: JWT Token Invalid**
- Check JWT_SECRET matches in .env
- Verify token is being sent in Authorization header
- Token might be expired (24hr validity)

**Issue: Products Not Showing**
- Add products through admin panel first
- Check database has product documents
- Verify API endpoint returns data in DevTools

---

## 📈 Next Steps

1. **Payment Integration**: Add Razorpay/Stripe
2. **Email Notifications**: SendGrid for order updates
3. **Search & Analytics**: Elasticsearch for better search
4. **Mobile App**: React Native version
5. **Delivery Tracking**: Integrate with delivery APIs
6. **Ratings & Reviews**: Add product ratings
7. **Real-time Updates**: WebSocket for live order updates
8. **Multi-language**: i18n for Indian languages

---

## 📞 Support & Issues

- Check MongoDB is running
- Verify .env variables
- Check console for error messages
- Test API endpoints with Postman

---

## 📄 License
Open source - Feel free to modify and use!

---

**Happy Coding! 💊✨**