// config/database.js
const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

// 定義資料庫配置
const dbConfigs = {
    // main 資料庫配置
    main: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER || 'localhost',
        database: process.env.DB_NAME,
        options: {
            encrypt: true,
            trustServerCertificate: true,
            enableArithAbort: true
        },
        port: parseInt(process.env.DB_PORT) || 1433
    },
    // ERP 資料庫配置
    erp: {
        user: process.env.ERP_DB_USER,
        password: process.env.ERP_DB_PASSWORD,
        server: process.env.ERP_DB_SERVER || 'localhost',
        database: process.env.ERP_DB_NAME,
        options: {
            encrypt: true,
            trustServerCertificate: true,
            enableArithAbort: true
        },
        port: parseInt(process.env.ERP_DB_PORT) || 1433
    },
    // MES 資料庫配置
    mes: {
        user: process.env.MES_DB_USER,
        password: process.env.MES_DB_PASSWORD,
        server: process.env.MES_DB_SERVER || 'localhost',
        database: process.env.MES_DB_NAME,
        options: {
            encrypt: true,
            trustServerCertificate: true,
            enableArithAbort: true
        },
        port: parseInt(process.env.MES_DB_PORT) || 1433
    }
};

// 存儲數據庫連接池
const pools = {
    erp: null,
    mes: null
};

// 連接指定的資料庫
const connectDB = async (dbName) => {
    try {
        const config = dbConfigs[dbName];
        if (!config) {
            throw new Error(`Unknown database: ${dbName}`);
        }

        if (!pools[dbName]) {
            console.log(`Connecting to ${dbName} database...`);
            pools[dbName] = await sql.connect(config);
            console.log(`${dbName} database connected successfully`);
        }
        return pools[dbName];
    } catch (err) {
        console.error(`${dbName} database connection failed:`, err);
        throw err;
    }
};

// 獲取指定資料庫的連接池
const getPool = async (dbName) => {
    if (!pools[dbName]) {
        await connectDB(dbName);
    }
    return pools[dbName];
};

module.exports = {
    connectDB,
    getPool,
    sql
};