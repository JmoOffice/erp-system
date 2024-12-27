// server/src/routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 未結訂單查詢相關路由
router.get('/unDeliveryOrders', orderController.getUndeliveredOrders);
router.get('/unDeliveryOrders/export', orderController.exportUndeliveredOrders);

// 測試路由
router.get('/test', (req, res) => {
   res.json({ message: 'Orders route is working' });
});

module.exports = router;

