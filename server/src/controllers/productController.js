const { getPool, sql } = require('../config/database');

// 獲取所有產品
const getProducts = async (req, res) => {
    try {
        const pool = await getPool('main');
        const result = await pool.request()
            .query('SELECT * FROM Products ORDER BY created_at DESC');
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error getting products:', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

// 獲取單個產品
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool('main');
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Products WHERE id = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: '找不到產品' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error getting product by id:', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

// 創建產品
const createProduct = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        
        if (!name || !price) {
            return res.status(400).json({ message: '產品名稱和價格是必填的' });
        }

        const pool = await getPool('main');
        
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description || '')
            .input('price', sql.Decimal(10, 2), price)
            .query(`
                INSERT INTO Products (name, description, price)
                VALUES (@name, @description, @price);
                SELECT SCOPE_IDENTITY() AS id;
            `);

        res.status(201).json({
            message: '產品創建成功',
            id: result.recordset[0].id
        });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

// 更新產品
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        const pool = await getPool('main');
        
        if (!name && !description && !price) {
            return res.status(400).json({ message: '至少需要提供一個要更新的欄位' });
        }

        let query = 'UPDATE Products SET ';
        const inputs = [];
        
        if (name) inputs.push('name = @name');
        if (description) inputs.push('description = @description');
        if (price) inputs.push('price = @price');
        
        query += inputs.join(', ') + ' WHERE id = @id';
        
        const request = pool.request()
            .input('id', sql.Int, id);
            
        if (name) request.input('name', sql.NVarChar, name);
        if (description) request.input('description', sql.NVarChar, description);
        if (price) request.input('price', sql.Decimal(10, 2), price);
        
        const result = await request.query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: '找不到產品' });
        }
        
        res.json({ message: '產品更新成功' });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

// 刪除產品
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool('main');
        
        // 檢查是否有相關的訂單項目
        const orderItemCheck = await pool.request()
            .input('product_id', sql.Int, id)
            .query('SELECT TOP 1 id FROM OrderItems WHERE product_id = @product_id');

        if (orderItemCheck.recordset.length > 0) {
            return res.status(400).json({ 
                message: '無法刪除此產品，因為已經有相關的訂單' 
            });
        }
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Products WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: '找不到產品' });
        }
        
        res.json({ message: '產品刪除成功' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: '伺服器錯誤' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};