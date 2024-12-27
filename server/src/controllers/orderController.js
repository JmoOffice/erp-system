// server/src/controllers/orderController.js
const { getPool, sql } = require('../config/database');
const ExcelJS = require('exceljs');

// 未結訂單查詢
const getUndeliveredOrders = async (req, res) => {
    try {
        const {
            orderNo,
            mtlItemNo,
            mtlItemName,
            startDate,
            endDate,
            page = 1,
            pageSize = 10
        } = req.query;

        const pool = await getPool('erp');
        let query = `
            SELECT 
                a.TC001 + '-' + a.TC002 as OrderNo,
                b.TD003 as OrderSeq,
                b.TD004 as MtlItemNo,
                b.TD005 as MtlItemName,
                b.TD006 as MtlItemSpec,
                b.TD013 as ExpectDeliveryDate,
                b.TD008 as OrderQty,
                b.TD011 as UnitPrice,
                b.TD012 as Amount,
                b.TD009 as DeliveryQty,
                b.TD008 - b.TD009 as unDeliveryQty
            FROM COPTC a
            INNER JOIN COPTD b ON a.TC001 = b.TD001 AND a.TC002 = b.TD002
            WHERE a.TC027 = 'Y'
                AND b.TD008 - b.TD009 >= 0
                AND b.TD016 = 'N'
                AND b.TD021 = 'Y'
        `;

        // 加入搜尋條件
        if (orderNo) {
            query += ` AND (a.TC001 + '-' + a.TC002 LIKE @orderNo)`;
        }
        if (mtlItemNo) {
            query += ` AND b.TD004 LIKE @mtlItemNo`;
        }
        if (mtlItemName) {
            query += ` AND b.TD005 LIKE @mtlItemName`;
        }
        if (startDate) {
            query += ` AND b.TD013 >= @startDate`;
        }
        if (endDate) {
            query += ` AND b.TD013 <= @endDate`;
        }

        // 計算總筆數
        const countQuery = query.replace(
            'SELECT',
            'SELECT COUNT(*) as total'
        );

        // 加入排序和分頁
        query += ` ORDER BY b.TD013
                  OFFSET @offset ROWS
                  FETCH NEXT @pageSize ROWS ONLY`;

        // 執行查詢
        const request = pool.request();

        // 設置參數
        if (orderNo) {
            request.input('orderNo', sql.NVarChar, `%${orderNo}%`);
        }
        if (mtlItemNo) {
            request.input('mtlItemNo', sql.NVarChar, `%${mtlItemNo}%`);
        }
        if (mtlItemName) {
            request.input('mtlItemName', sql.NVarChar, `%${mtlItemName}%`);
        }
        if (startDate) {
            request.input('startDate', sql.NVarChar, startDate);
        }
        if (endDate) {
            request.input('endDate', sql.NVarChar, endDate);
        }

        request.input('offset', sql.Int, (page - 1) * pageSize);
        request.input('pageSize', sql.Int, parseInt(pageSize));

        // 執行查詢
        const [totalResult, dataResult] = await Promise.all([
            pool.request().query(countQuery),
            request.query(query)
        ]);

        res.json({
            total: totalResult.recordset[0].total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            data: dataResult.recordset
        });

    } catch (err) {
        console.error('Error getting undelivered orders:', err);
        res.status(500).json({ message: '取得未結訂單資料失敗' });
    }
};

// 匯出未結訂單
const exportUndeliveredOrders = async (req, res) => {
    // ... Excel 匯出相關代碼 ...
};

module.exports = {
    getUndeliveredOrders,
    exportUndeliveredOrders
};