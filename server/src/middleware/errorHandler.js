// server/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: '資料驗證錯誤',
        errors: err.errors
      });
    }
  
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        message: '未授權的請求'
      });
    }
  
    return res.status(500).json({
      message: '伺服器內部錯誤'
    });
  };
  
  module.exports = errorHandler;