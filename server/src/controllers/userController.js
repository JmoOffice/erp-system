const { getPool, sql } = require('../config/database');
const bcrypt = require('bcrypt');

// 獲取所有使用者 - 使用 main 資料庫
const getUsers = async (req, res) => {
    try {
        const pool = await getPool('main'); // 指定使用 main 資料庫
        const result = await pool.request()
            .query('SELECT id, username, email, created_at FROM Users');
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error getting users:', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

// 獲取單個使用者
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool('main'); // 指定使用 main 資料庫
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT id, username, email, created_at FROM Users WHERE id = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: '找不到使用者' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error getting user by id:', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

// 更新使用者
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;
        const pool = await getPool('main'); // 指定使用 main 資料庫
        
        // ... 其餘程式碼不變 ...
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

// 刪除使用者
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool('main'); // 指定使用 main 資料庫
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Users WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: '找不到使用者' });
        }
        
        res.json({ message: '使用者刪除成功' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

// 創建新使用者
const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: '所有欄位都是必填的' });
        }

        const pool = await getPool('main'); // 指定使用 main 資料庫
        
        // ... 其餘程式碼不變 ...
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    createUser
};