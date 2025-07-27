const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Dukan backend running');
});

// Auth
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Products
const productRoutes = require('./routes/product');
app.use('/api/products', productRoutes);

// Cart
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

// Admin User Management
const adminUserRoutes = require('./routes/adminUsers');
app.use('/api/admin/users', adminUserRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
