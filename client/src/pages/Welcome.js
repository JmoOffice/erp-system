// client/src/pages/Welcome.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Welcome = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome</h1>
      <p className="text-xl text-gray-600">
        {user?.username ? `歡迎回來，${user.username}` : '歡迎使用首沐 ERP 管理系統'}
      </p>
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          您可以使用上方選單開始使用系統功能
        </p>
        <p className="text-gray-500 mt-2">
          如需協助請聯繫系統管理員
        </p>
      </div>
    </div>
  );
};

export default Welcome;