// client/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome.js';
import MemberManagement from './pages/MemberManagement';
import OrderManagement from './pages/OrderManagement';
import UndeliveredOrders from './pages/UndeliveredOrders';
import ProductManagement from './pages/ProductManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Welcome />} />
            <Route path="members" element={<MemberManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/undelivered" element={<UndeliveredOrders />} />
            <Route path="products" element={<ProductManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;