const pool = require('../db');

async function getCartItemsByUser(userId) {
  const query = `
    SELECT c.id, c.quantity, p.id AS product_id, p.name, p.description, p.price, p.inventory_count, cat.name AS category
    FROM carts c
    JOIN products p ON c.product_id = p.id
    JOIN categories cat ON p.category_id = cat.id
    WHERE c.user_id = $1;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
}

async function addOrUpdateCartItem(userId, productId, quantity) {
  // Check if product is already in cart
  const existingQuery = 'SELECT quantity FROM carts WHERE user_id=$1 AND product_id=$2';
  const existing = await pool.query(existingQuery, [userId, productId]);

  if (existing.rows.length > 0) {
    // Update quantity
    const newQuantity = existing.rows[0].quantity + quantity;
    const updateQuery = 'UPDATE carts SET quantity=$1 WHERE user_id=$2 AND product_id=$3 RETURNING *';
    const { rows } = await pool.query(updateQuery, [newQuantity, userId, productId]);
    return rows[0];
  } else {
    // Insert new cart item
    const insertQuery = 'INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await pool.query(insertQuery, [userId, productId, quantity]);
    return rows[0];
  }
}

async function removeCartItem(userId, productId) {
  const deleteQuery = 'DELETE FROM carts WHERE user_id=$1 AND product_id=$2';
  await pool.query(deleteQuery, [userId, productId]);
}

async function clearCart(userId) {
  const deleteQuery = 'DELETE FROM carts WHERE user_id=$1';
  await pool.query(deleteQuery, [userId]);
}

module.exports = {
  getCartItemsByUser,
  addOrUpdateCartItem,
  removeCartItem,
  clearCart,
};
