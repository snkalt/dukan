const pool = require('../db');

async function getAllProducts() {
  const query = `
    SELECT p.id, p.name, p.description, p.price, p.inventory_count, c.name AS category
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

async function getProductById(id) {
  const query = 'SELECT * FROM products WHERE id = $1';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

async function createProduct({ name, description, price, category_id, inventory_count }) {
  const query = `
    INSERT INTO products (name, description, price, category_id, inventory_count)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;
  `;
  const values = [name, description, price, category_id, inventory_count];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function updateProduct(id, { name, description, price, category_id, inventory_count }) {
  const query = `
    UPDATE products
    SET name=$1, description=$2, price=$3, category_id=$4, inventory_count=$5, updated_at=NOW()
    WHERE id=$6 RETURNING *;
  `;
  const values = [name, description, price, category_id, inventory_count, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function deleteProduct(id) {
  const query = 'DELETE FROM products WHERE id=$1';
  await pool.query(query, [id]);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
