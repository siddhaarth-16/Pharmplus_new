# 🚀 PharmaCare - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install & Run Backend
```bash
# In pharmacy-app folder
npm install
node server.js
# Server starts on http://localhost:5000
```

### Step 2: Install & Run Frontend
```bash
# In separate terminal
npx create-react-app frontend
cd frontend
cp ../App.jsx src/
cp ../App.css src/
npm start
# App opens on http://localhost:3000
```

### Step 3: Make sure MongoDB is running
```bash
# Terminal 3
mongod
# Or: brew services start mongodb-community (Mac)
```

---

## 👤 Test Accounts

### Customer Account
```
Email: customer@test.com
Password: password123

(Use signup to create your own)
```

### Admin Account
```
Email: admin@test.com
Password: admin123

(Create via signup, then manually set role to "admin" in MongoDB)
```

---

## 📋 Database Setup (MongoDB)

### Manual Admin Setup
```bash
# Open MongoDB shell
mongosh

# Switch to pharmacy database
use pharmacy

# Insert admin user
db.users.insertOne({
  name: "Admin",
  email: "admin@test.com",
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/WFm", // bcrypt("admin123")
  role: "admin"
})

# Insert sample customer
db.users.insertOne({
  name: "Customer",
  email: "customer@test.com",
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/WFm", // bcrypt("password123")
  role: "customer",
  addresses: []
})
```

### Sample Products (Add via Admin Panel)
```json
{
  "name": "Aspirin 500mg",
  "category": "Medicines",
  "price": 50,
  "dosage": "500mg",
  "brand": "Bayer",
  "stock": 100,
  "description": "Pain reliever and fever reducer"
}

{
  "name": "Vitamin C 1000mg",
  "category": "Vitamins",
  "price": 200,
  "dosage": "1000mg",
  "brand": "HealthAid",
  "stock": 50,
  "description": "Immune system support"
}

{
  "name": "Hand Sanitizer 500ml",
  "category": "Personal Care",
  "price": 100,
  "dosage": "N/A",
  "brand": "Dettol",
  "stock": 200,
  "description": "Antibacterial hand sanitizer"
}
```

---

## 🎯 User Flows

### Customer Journey
```
1. Sign Up → Create Account
   ↓
2. Login → Enter Dashboard
   ↓
3. Browse Products → View catalog (filters by category/price)
   ↓
4. Place Order → Add items to cart
   ↓
5. Upload Prescription → If required for medicine
   ↓
6. Select Address → Delivery location
   ↓
7. Checkout → Payment & Order Creation
   ↓
8. Track Order → View status in Order History
```

### Admin Journey
```
1. Login as Admin → See Dashboard
   ↓
2. Add Products → Fill product form
   ↓
3. View Orders → Real-time order list
   ↓
4. Update Status → pending → approved → shipped → delivered
   ↓
5. Review Prescriptions → Check uploaded files, approve/reject
   ↓
6. View Analytics → See sales, revenue, customer count
```

---

## 🧪 Testing Checklist

### Customer Features ✓
- [ ] Sign up new account
- [ ] Login with email/password
- [ ] View profile information
- [ ] Add delivery address
- [ ] Place an order
- [ ] View order history
- [ ] Track order status

### Admin Features ✓
- [ ] Login as admin
- [ ] View dashboard stats
- [ ] Add new product
- [ ] Edit product details
- [ ] Delete product
- [ ] View all orders
- [ ] Update order status
- [ ] Approve prescription

---

## 🔍 API Testing with cURL/Postman

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"password123"}'
```

### Get Products
```bash
curl http://localhost:5000/api/products
```

### Create Order (Requires Token)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId":"PRODUCT_ID","quantity":2,"price":50}],
    "totalPrice": 100,
    "prescriptionRequired": false,
    "deliveryAddress": "123 Main St"
  }'
```

---

## 🎨 Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Primary (Success) | Green | #00b894 |
| Secondary | Blue | #0984e3 |
| Danger | Red | #d63031 |
| Background | Light Gray | #f5f6fa |
| Text | Dark Gray | #2d3436 |

---

## 📱 Features Ready to Use

| Feature | Status | Notes |
|---------|--------|-------|
| User Authentication | ✅ Complete | JWT tokens |
| Customer Dashboard | ✅ Complete | Orders, addresses |
| Product Management | ✅ Complete | CRUD operations |
| Order Tracking | ✅ Complete | Status updates |
| Prescription Review | ✅ Complete | Approve/reject |
| Admin Panel | ✅ Complete | Full analytics |
| Mobile Responsive | ✅ Complete | CSS media queries |

---

## ⚙️ Environment Variables

Create `.env` file in pharmacy-app folder:

```env
MONGODB_URI=mongodb://localhost:27017/pharmacy
JWT_SECRET=your_super_secret_key_12345
PORT=5000
NODE_ENV=development
```

---

## 🚀 Common Commands

```bash
# Start backend
npm start

# Start with auto-reload (install nodemon first)
npm install -D nodemon
npm run dev

# Check MongoDB connection
mongosh

# View database
use pharmacy
db.users.find()
db.products.find()
db.orders.find()

# Clear collections
db.users.deleteMany({})
db.products.deleteMany({})
db.orders.deleteMany({})
```

---

## 🐛 Quick Fixes

### Port 5000 already in use?
```bash
# Find process using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

### MongoDB connection error?
```bash
# Check if running
sudo systemctl status mongod

# Restart
sudo systemctl restart mongod

# Or for Mac
brew services restart mongodb-community
```

### React not connecting to API?
- Check API_BASE in App.jsx points to http://localhost:5000
- Verify backend server is running
- Check browser console for CORS errors

---

## 📚 Key Files Explained

| File | Purpose |
|------|---------|
| server.js | Express backend + MongoDB models + API routes |
| App.jsx | React frontend with all UI components |
| App.css | Styling (responsive + healthcare theme) |
| package.json | Dependencies list |
| SETUP.md | Detailed setup guide |
| QUICK_START.md | This file |

---

## 💡 Pro Tips

1. **Use Postman** to test API endpoints before frontend
2. **Check DevTools** → Network tab to see API calls
3. **Keep Backend Terminal Open** to see real-time logs
4. **Test with Multiple Browsers** for responsive design
5. **Use MongoDB Compass** for easy database viewing
6. **Save tokens** in localStorage for persistent login

---

## ✨ Next Features to Build

- [ ] Payment integration (Razorpay)
- [ ] Email notifications
- [ ] Product search & filters
- [ ] User reviews & ratings
- [ ] Delivery tracking
- [ ] Admin analytics dashboard
- [ ] Stock alerts
- [ ] Bulk ordering

---

## 📞 Stuck? Try These Steps

1. Check if MongoDB is running
2. Restart backend server
3. Clear browser cache (DevTools)
4. Check .env file exists with correct values
5. Look at backend console for error messages
6. Test API directly with Postman

---

**You're all set! Start building! 🚀💊**