const pool = require('../db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function createUser({ name, email, phone, gender, dob, password, is_admin = false }) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const query = `
    INSERT INTO users (name, email, phone, gender, dob, password, is_admin)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, name, email, phone, gender, dob, is_admin, created_at;
  `;
  const values = [name, email, phone, gender, dob, hashedPassword, is_admin];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function findUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await pool.query(query, [email]);
  return rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
};
