const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getPool, sql } = require('../config/database');

// 登入路由
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username); // 除錯日誌

        const pool = await getPool();
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');

        const user = result.recordset[0];
        
        if (!user) {
            console.log('User not found:', username); // 除錯日誌
            return res.status(401).json({ message: '使用者名稱或密碼錯誤' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            console.log('Invalid password for user:', username); // 除錯日誌
            return res.status(401).json({ message: '使用者名稱或密碼錯誤' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful for user:', username); // 除錯日誌
        res.json({ 
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err); // 除錯日誌
        res.status(500).json({ message: '伺服器錯誤' });
    }
});

// 註冊路由
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        console.log('Register attempt for username:', username); // 除錯日誌

        // 驗證必要欄位
        if (!username || !password || !email) {
            return res.status(400).json({ message: '所有欄位都是必填的' });
        }

        const pool = await getPool();

        // 檢查使用者名稱是否已存在
        const userCheck = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT id FROM Users WHERE username = @username');

        if (userCheck.recordset.length > 0) {
            return res.status(400).json({ message: '使用者名稱已存在' });
        }

        // 檢查 email 是否已存在
        const emailCheck = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id FROM Users WHERE email = @email');

        if (emailCheck.recordset.length > 0) {
            return res.status(400).json({ message: 'Email 已被使用' });
        }

        // 密碼加密
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 創建新使用者
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('email', sql.NVarChar, email)
            .query(`
                INSERT INTO Users (username, password, email)
                VALUES (@username, @password, @email);
                SELECT SCOPE_IDENTITY() AS id;
            `);

        console.log('register-99');
        const userId = result.recordset[0].id;

        // 生成 JWT
        const token = jwt.sign(
            { id: userId, username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Registration successful for user:', username); // 除錯日誌
        res.status(201).json({
            message: '註冊成功',
            token,
            user: {
                id: userId,
                username,
                email
            }
        });
    } catch (err) {
        console.error('Registration error:', err); // 除錯日誌
        res.status(500).json({ message: '伺服器錯誤' });
    }
});

// 驗證 Token 路由
router.get('/verify', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: '未提供認證令牌' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const pool = await getPool();
        
        const result = await pool.request()
            .input('id', sql.Int, decoded.id)
            .query('SELECT id, username, email FROM Users WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: '找不到使用者' });
        }

        res.json({ 
            user: result.recordset[0]
        });
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({ message: '無效的認證令牌' });
    }
});

module.exports = router;