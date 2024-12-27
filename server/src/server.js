// server/src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/users');
//const productsRoutes = require('./routes/products');
//const orderRoutes = require('./routes/orders');
const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // 解析 URL-encoded 請求體

// 路由測試
app.get('/test', (req, res) => {
   res.json({ message: 'Server is running' });
});

// 路由設定
app.use('/api/users', userRoutes);
//app.use('/api/products', productsRoutes);
//app.use('/api/orders', orderRoutes);

// 404 處理
app.use((req, res) => {
   console.log(`404 - Not Found(error in here): ${req.method} ${req.originalUrl}`);
   res.status(404).json({ message: 'Route not found' });
});

// 錯誤處理
app.use((err, req, res, next) => {
   console.error('Error:', err);
   res.status(500).json({ message: 'Internal server error' });
});

// 初始化資料庫連接
const initializeApp = async () => {
   try {
       // 連接主資料庫
       await connectDB('main');
       console.log('Main database connected successfully');

       // 連接 ERP 資料庫
       await connectDB('erp');
       console.log('ERP database connected successfully');

       const PORT = process.env.PORT || 3001;
       app.listen(PORT, () => {
           console.log(`Server is running on port ${PORT}`);
       });
   } catch (err) {
       console.error('Failed to initialize app:', err);
       process.exit(1);
   }
};

initializeApp();

// 優雅關閉
process.on('SIGTERM', () => {
   console.log('SIGTERM received. Closing server...');
   server.close(() => {
       console.log('Server closed');
       process.exit(0);
   });
});