import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, ChevronDown, LogOut } from 'lucide-react';

const Navigation = () => {
  const [openMenus, setOpenMenus] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const [isSubMenuHovered, setIsSubMenuHovered] = useState(false);

  const menuItems = [
    {
      id: 'system',
      label: '系統管理',
      items: [
        { id: 'members', label: '會員管理', path: '/members' }
      ]
    },
    {
      id: 'sales',
      label: '銷售管理系統',
      items: [
        { id: 'orders', label: '訂單管理', path: '/orders' },
        { id: 'undelivered-orders', label: '未結訂單明細查詢', path: '/orders/undelivered' }
      ]
    },
    {
      id: 'products',
      label: '產品管理',
      items: [
        { id: 'product-maintenance', label: '產品資料維護', path: '/products' }
      ]
    }
  ];

  const handleMouseEnter = (menuId) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenMenus([menuId]);
  };

  const handleMouseLeave = (menuId) => {
    if (!isSubMenuHovered) {
      timeoutRef.current = setTimeout(() => {
        setOpenMenus([]);
      }, 300);
    }
  };

  const handleSubMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsSubMenuHovered(true);
  };

  const handleSubMenuMouseLeave = () => {
    setIsSubMenuHovered(false);
    timeoutRef.current = setTimeout(() => {
      setOpenMenus([]);
    }, 300);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white font-bold text-xl">
              首沐 ERP 管理系統
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex space-x-4">
                {menuItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={() => handleMouseLeave(item.id)}
                  >
                    <button
                      className={`flex items-center px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white ${
                        openMenus.includes(item.id) ? 'bg-gray-700 text-white' : ''
                      }`}
                    >
                      <span className="mr-2">{item.label}</span>
                      <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${
                        openMenus.includes(item.id) ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {openMenus.includes(item.id) && (
                      <div 
                        className="absolute z-10 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                        onMouseEnter={handleSubMenuMouseEnter}
                        onMouseLeave={handleSubMenuMouseLeave}
                      >
                        <div className="py-1">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.id}
                              to={subItem.path}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setOpenMenus([])}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="h-5 w-5 mr-2" />
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;