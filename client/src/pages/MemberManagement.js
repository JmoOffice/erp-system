import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, UserPlus, Edit2, Trash2, X } from 'lucide-react';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [searchQuery, setSearchQuery] = useState('');
  const [memberForm, setMemberForm] = useState({
    id: '',
    username: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/users');
      setMembers(response.data);
      setLoading(false);
    } catch (err) {
      setError('載入會員資料失敗');
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, member = null) => {
    setModalMode(mode);
    if (member) {
      setMemberForm({ ...member, password: '' });
    } else {
      setMemberForm({ id: '', username: '', email: '', password: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await api.post('/users', memberForm);
      } else {
        await api.put(`/users/${memberForm.id}`, memberForm);
      }
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      setError(modalMode === 'create' ? '新增會員失敗' : '更新會員失敗');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('確定要刪除此會員嗎？')) {
      try {
        await api.delete(`/users/${id}`);
        fetchMembers();
      } catch (err) {
        setError('刪除會員失敗');
      }
    }
  };

  const filteredMembers = members.filter(member => 
    member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center">載入中...</div>;
  if (error) return <div className="text-red-600 text-center">{error}</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header & Search Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">會員管理</h1>
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          新增會員
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="搜尋會員..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Members Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">使用者名稱</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">建立時間</th>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{member.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{member.username}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{member.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <button
                          onClick={() => handleOpenModal('edit', member)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-gray-900">
                {modalMode === 'create' ? '新增會員' : '編輯會員'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 ml-1">
                  使用者名稱
                </label>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={memberForm.username}
                  onChange={(e) => setMemberForm({...memberForm, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 ml-1">
                  密碼{modalMode === 'edit' && ' (若不修改請留空)'}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={memberForm.password}
                  onChange={(e) => setMemberForm({...memberForm, password: e.target.value})}
                />
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {modalMode === 'create' ? '新增' : '更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;