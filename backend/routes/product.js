const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const productModel = require('../models/productModel');

// Get all products (accessible by logged-in users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product by id (optional)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await productModel.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new product (admin only)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, description, price, category_id, inventory_count } = req.body;
    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Name, price and category are required' });
    }

    const newProduct = await productModel.createProduct({ name, description, price, category_id, inventory_count: inventory_count || 0 });
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, description, price, category_id, inventory_count } = req.body;
    const updatedProduct = await productModel.updateProduct(req.params.id, { name, description, price, category_id, inventory_count });
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    await productModel.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
