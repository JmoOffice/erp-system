const express = require('express');
const router = express.Router();
const { 
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const authenticateToken = require('../middleware/auth');

// 套用認證中間件
router.use(authenticateToken);

// 路由定義
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;