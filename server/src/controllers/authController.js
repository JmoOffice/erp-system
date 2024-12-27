// server/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');

const login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');

    const user = result.recordset[0];
    
    if (!user) {
      return res.status(401).json({ message: '使用者名稱或密碼錯誤' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: '使用者名稱或密碼錯誤' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

const register = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const pool = getPool();
    
    // Check if username exists
    const userCheck = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT id FROM Users WHERE username = @username');

    if (userCheck.recordset.length > 0) {
      return res.status(400).json({ message: '使用者名稱已存在' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hashedPassword)
      .input('email', sql.NVarChar, email)
      .query(`
        INSERT INTO Users (username, password, email)
        VALUES (@username, @password, @email);
        SELECT SCOPE_IDENTITY() AS id;
      `);

    const userId = result.recordset[0].id;
    const token = jwt.sign(
      { id: userId, username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: '註冊成功',
      token,
      user: { id: userId, username }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

module.exports = {
  login,
  register
};
