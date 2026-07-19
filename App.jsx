import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await response.json();
      setUser(userData);
      setCurrentPage(userData.role === 'admin' ? 'admin-dashboard' : 'customer-dashboard');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setCurrentPage('login');
  };

  // ==================== LOGIN / SIGNUP ====================
  if (currentPage === 'login' && !token) {
    return <LoginPage setToken={setToken} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'signup' && !token) {
    return <SignupPage setCurrentPage={setCurrentPage} />;
  }

  // ==================== CUSTOMER DASHBOARD ====================
  if (currentPage === 'customer-dashboard' && user?.role === 'customer') {
    return (
      <CustomerDashboard
        user={user}
        token={token}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        fetchUserProfile={fetchUserProfile}
      />
    );
  }

  // ==================== ADMIN DASHBOARD ====================
  if (currentPage === 'admin-dashboard' && user?.role === 'admin') {
    return (
      <AdminDashboard
        user={user}
        token={token}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      />
    );
  }

  return <div>Loading...</div>;
}

// ==================== LOGIN PAGE ====================
function LoginPage({ setToken, setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>💊 PharmaCare</h1>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Login</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="auth-toggle">
          Don't have an account? <span onClick={() => setCurrentPage('signup')} className="link">Sign up</span>
        </p>
      </div>
    </div>
  );
}

// ==================== SIGNUP PAGE ====================
function SignupPage({ setCurrentPage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (data.message) {
        setSuccess('Account created! Please login.');
        setTimeout(() => setCurrentPage('login'), 2000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>💊 PharmaCare</h1>
        <h2>Create Account</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <p className="auth-toggle">
          Already have an account? <span onClick={() => setCurrentPage('login')} className="link">Login</span>
        </p>
      </div>
    </div>
  );
}

// ==================== CUSTOMER DASHBOARD ====================
function CustomerDashboard({ user, token, setCurrentPage, handleLogout, fetchUserProfile }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/customer/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const addAddress = async () => {
    const newAddress = {
      street: prompt('Enter street:'),
      city: prompt('Enter city:'),
      zipcode: prompt('Enter zipcode:'),
      default: false
    };

    if (newAddress.street && newAddress.city && newAddress.zipcode) {
      try {
        const response = await fetch(`${API_BASE}/customer/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify([...addresses, newAddress])
        });
        const data = await response.json();
        setAddresses(data.addresses);
      } catch (error) {
        console.error('Error adding address:', error);
      }
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>💊 PharmaCare</h1>
        <div className="header-right">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Orders
            </button>
            <button
              className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              📍 Addresses
            </button>
            <button
              className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              ❤️ Wishlist
            </button>
          </nav>
        </aside>

        <main className="content">
          {activeTab === 'orders' && (
            <div className="section">
              <h2>Order History</h2>
              {orders.length === 0 ? (
                <p className="empty">No orders yet</p>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <span>Order ID: {order._id}</span>
                        <span className={`status ${order.status}`}>{order.status}</span>
                      </div>
                      <p>Items: {order.items.length}</p>
                      <p>Total: ₹{order.totalPrice}</p>
                      <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                      {order.prescriptionRequired && (
                        <p className="prescription-status">
                          Prescription: <span className={order.prescriptionStatus}>{order.prescriptionStatus}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="section">
              <h2>Saved Addresses</h2>
              <button onClick={addAddress} className="btn-primary">+ Add Address</button>
              {addresses.length === 0 ? (
                <p className="empty">No addresses saved</p>
              ) : (
                <div className="addresses-list">
                  {addresses.map((addr, index) => (
                    <div key={index} className="address-card">
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.zipcode}</p>
                      {addr.default && <span className="badge">Default</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="section">
              <h2>Wishlist</h2>
              <p className="empty">Wishlist feature coming soon</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard({ user, token, setCurrentPage, handleLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Medicines',
    price: '',
    dosage: '',
    brand: '',
    stock: '',
    description: ''
  });

  useEffect(() => {
    fetchStats();
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        })
      });
      const data = await response.json();
      setProducts([...products, data]);
      setNewProduct({
        name: '',
        category: 'Medicines',
        price: '',
        dosage: '',
        brand: '',
        stock: '',
        description: ''
      });
      alert('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      setOrders(orders.map(o => o._id === orderId ? data : o));
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const approvePrescription = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders/${orderId}/prescription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prescriptionStatus: 'approved' })
      });
      const data = await response.json();
      setOrders(orders.map(o => o._id === orderId ? data : o));
    } catch (error) {
      console.error('Error approving prescription:', error);
    }
  };

  return (
    <div className="dashboard admin-dashboard">
      <header className="header">
        <h1>💊 PharmaCare Admin</h1>
        <div className="header-right">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Products
            </button>
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              🛒 Orders
            </button>
            <button
              className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              📋 Prescriptions
            </button>
          </nav>
        </aside>

        <main className="content">
          {activeTab === 'dashboard' && stats && (
            <div className="section">
              <h2>Dashboard</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{stats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
                <div className="stat-card">
                  <h3>₹{stats.totalRevenue}</h3>
                  <p>Total Revenue</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalCustomers}</h3>
                  <p>Total Customers</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.pendingPrescriptions}</h3>
                  <p>Pending Prescriptions</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="section">
              <h2>Manage Products</h2>
              <form onSubmit={handleAddProduct} className="product-form">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option>Medicines</option>
                  <option>Vitamins</option>
                  <option>Personal Care</option>
                  <option>Baby Care</option>
                  <option>Medical Devices</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={newProduct.dosage}
                  onChange={(e) => setNewProduct({ ...newProduct, dosage: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Brand"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
                <button type="submit" className="btn-primary">Add Product</button>
              </form>

              <div className="products-list">
                <h3>All Products ({products.length})</h3>
                {products.map((product) => (
                  <div key={product._id} className="product-item">
                    <div>
                      <strong>{product.name}</strong>
                      <p>{product.category} - {product.brand}</p>
                      <p>₹{product.price} | Stock: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="section">
              <h2>Manage Orders</h2>
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="admin-order-card">
                    <div className="order-info">
                      <strong>Order ID: {order._id}</strong>
                      <p>Customer: {order.userId?.name}</p>
                      <p>Total: ₹{order.totalPrice}</p>
                      <p>Status: <span className={`status ${order.status}`}>{order.status}</span></p>
                    </div>
                    <div className="order-actions">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="section">
              <h2>Review Prescriptions</h2>
              <div className="prescriptions-list">
                {orders
                  .filter(order => order.prescriptionRequired)
                  .map((order) => (
                    <div key={order._id} className="prescription-card">
                      <div className="prescription-info">
                        <strong>Order ID: {order._id}</strong>
                        <p>Customer: {order.userId?.name}</p>
                        <p>Status: <span className={`status ${order.prescriptionStatus}`}>{order.prescriptionStatus}</span></p>
                      </div>
                      <div className="prescription-actions">
                        {order.prescriptionStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => approvePrescription(order._id)}
                              className="btn-approve"
                            >
                              ✓ Approve
                            </button>
                            <button className="btn-reject">✕ Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                {orders.filter(order => order.prescriptionRequired).length === 0 && (
                  <p className="empty">No prescriptions to review</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}