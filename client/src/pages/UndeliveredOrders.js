// pages/UndeliveredOrders.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const UndeliveredOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    
    // 搜尋條件
    const [searchParams, setSearchParams] = useState({
        orderNo: '',
        mtlItemNo: '',
        mtlItemName: '',
        startDate: '',
        endDate: '',
        page: 1,
        pageSize: 10
    });

    // 獲取資料
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const queryString = new URLSearchParams(searchParams).toString();
            // 確保這裡的 API 路徑正確
            const response = await api.get(`/orders/unDeliveryOrders?${queryString}`);
            setOrders(response.data.data);
            setTotal(response.data.total);
            setLoading(false);
            } catch (err) {
            setError('載入資料失敗');
            setLoading(false);
        }
      };

    useEffect(() => {
        fetchOrders();
    }, [searchParams]);

    // 處理搜尋
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(prev => ({ ...prev, page: 1 }));
    };

    // 處理匯出
    const handleExport = async () => {
        try {
            const queryString = new URLSearchParams({
                orderNo: searchParams.orderNo,
                mtlItemNo: searchParams.mtlItemNo,
                mtlItemName: searchParams.mtlItemName,
                startDate: searchParams.startDate,
                endDate: searchParams.endDate
            }).toString();

            const response = await api.get(
                `/orders/unDeliveryOrders/v?${queryString}`,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'UndeliveredOrders.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError('匯出失敗');
        }
    };

    // 分頁處理
    const handlePageChange = (newPage) => {
        setSearchParams(prev => ({ ...prev, page: newPage }));
    };

    // 每頁筆數變更
    const handlePageSizeChange = (e) => {
        setSearchParams(prev => ({
            ...prev,
            pageSize: e.target.value,
            page: 1
        }));
    };

    if (loading) return <div className="text-center">載入中...</div>;
    if (error) return <div className="text-red-600 text-center">{error}</div>;

    return (
        <div className="space-y-6 p-6">
            {/* 標題與匯出按鈕 */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">未結訂單明細查詢</h1>
                <button
                    onClick={handleExport}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    <Download className="w-4 h-4 mr-2" />
                    匯出 Excel
                </button>
            </div>

            {/* 搜尋表單 */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">訂單號碼</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border-2 rounded-md"
                        value={searchParams.orderNo}
                        onChange={e => setSearchParams(prev => ({ ...prev, orderNo: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">品號</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border-2 rounded-md"
                        value={searchParams.mtlItemNo}
                        onChange={e => setSearchParams(prev => ({ ...prev, mtlItemNo: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">品名</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border-2 rounded-md"
                        value={searchParams.mtlItemName}
                        onChange={e => setSearchParams(prev => ({ ...prev, mtlItemName: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">預計交貨日期(起)</label>
                    <input
                        type="date"
                        className="w-full px-4 py-2 border-2 rounded-md"
                        value={searchParams.startDate}
                        onChange={e => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">預計交貨日期(迄)</label>
                    <input
                        type="date"
                        className="w-full px-4 py-2 border-2 rounded-md"
                        value={searchParams.endDate}
                        onChange={e => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                </div>
                <div className="md:col-span-3 flex justify-end">
                    <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        搜尋
                    </button>
                </div>
            </form>

            {/* 表格 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">訂單號碼</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">序號</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品號</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品名</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">規格</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">預計交貨日</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">訂單數量</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">單價</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">已交數量</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">未交數量</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order, index) => (
                                <tr key={`${order.OrderNo}-${order.OrderSeq}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.OrderNo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.OrderSeq}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.MtlItemNo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.MtlItemName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.MtlItemSpec}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(order.ExpectDeliveryDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {order.OrderQty.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {order.UnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {order.Amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {order.DeliveryQty.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        {order.unDeliveryQty.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 分頁控制 */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex items-center">
                        <span className="mr-2">每頁顯示:</span>
                        <select
                            value={searchParams.pageSize}
                            onChange={handlePageSizeChange}
                            className="border-2 rounded-md px-2 py-1"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                        </select>
                        <span className="ml-4">
                            共 {total} 筆資料
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(searchParams.page - 1)}
                            disabled={searchParams.page === 1}
                            className={`px-3 py-1 rounded-md ${
                                searchParams.page === 1
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span>
                            第 {searchParams.page} 頁，共 {Math.ceil(total / searchParams.pageSize)} 頁
                        </span>
                        <button
                            onClick={() => handlePageChange(searchParams.page + 1)}
                            disabled={searchParams.page >= Math.ceil(total / searchParams.pageSize)}
                            className={`px-3 py-1 rounded-md ${
                                searchParams.page >= Math.ceil(total / searchParams.pageSize)
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UndeliveredOrders;