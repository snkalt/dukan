const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const cartModel = require('../models/cartModel');

// Get all cart items for logged in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await cartModel.getCartItemsByUser(userId);
    res.json(cartItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add/update product quantity in cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'product_id and positive quantity required' });
    }

    const updatedCartItem = await cartModel.addOrUpdateCartItem(userId, product_id, quantity);
    res.json(updatedCartItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove product from cart
router.delete('/remove/:product_id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.product_id;

    await cartModel.removeCartItem(userId, productId);
    res.json({ message: 'Product removed from cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear entire cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await cartModel.clearCart(userId);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
