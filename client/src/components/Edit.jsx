// src/components/Edit.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Edit = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    amount: '',
    category: '',
    memo: ''
  });
  
  // フィルタリング用のステート
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  const navigate = useNavigate();

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/expenses`);
      setExpenses(res.data);
      
      // 利用可能な月とカテゴリーを取得
      const months = [...new Set(res.data.map(item => item.date ? item.date.substring(0, 7) : null))]
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a)); // 降順でソート
      
      const categories = [...new Set(res.data.map(item => item.category))].filter(Boolean);
      
      setAvailableMonths(months);
      setAvailableCategories(categories);
    } catch (error) {
      console.error(error);
      alert('Error fetching data');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // フィルタリングを適用
  useEffect(() => {
    if (expenses.length > 0) {
      let filtered = [...expenses];
      
      // 月別フィルタリング
      if (selectedMonth !== 'all') {
        filtered = filtered.filter(expense => 
          expense.date && expense.date.substring(0, 7) === selectedMonth
        );
      }
      
      // カテゴリ別フィルタリング
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(expense => 
          expense.category === selectedCategory
        );
      }
      
      setFilteredExpenses(filtered);
    }
  }, [expenses, selectedMonth, selectedCategory]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
  
    try {
      await axios.delete(`${API_URL}/api/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error(error);
      alert('Error deleting data');
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({
      date: expense.date,
      amount: expense.amount,
      category: expense.category,
      memo: expense.memo || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      date: '',
      amount: '',
      category: '',
      memo: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/api/expenses/${id}`, editForm);
      setEditingId(null);
      fetchExpenses();
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50';
      toast.textContent = '更新しました';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    } catch (error) {
      console.error(error);
      alert('Error updating data');
    }
  };

  // Get categories from localStorage
  const getSavedCategories = () => {
    const storedCategories = localStorage.getItem('expenseCategories');
    if (storedCategories) {
      return JSON.parse(storedCategories);
    }
    return [
      { id: 'food', name: '食費', icon: '🍔' },
      { id: 'transport', name: '交通費', icon: '🚃' }
    ];
  };

  const savedCategories = getSavedCategories();

  // カテゴリの名前を取得するヘルパー関数
  const getCategoryName = (categoryId) => {
    const category = savedCategories.find(cat => cat.id === categoryId);
    return category ? `${category.icon} ${category.name}` : categoryId;
  };

  // フィルターをリセットする関数
  const resetFilters = () => {
    setSelectedMonth('all');
    setSelectedCategory('all');
  };

  // フィルター適用後のデータ件数
  const filteredCount = filteredExpenses.length;
  // 全データ件数
  const totalCount = expenses.length;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">編集・履歴</h2>
      
      {/* フィルタリングパネル */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">フィルタリング</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 月フィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">月</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">すべての月</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          {/* カテゴリフィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">すべてのカテゴリ</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>{getCategoryName(cat)}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* フィルター情報と操作 */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            表示中: {filteredCount} / {totalCount} 件
          </div>
          
          <button
            onClick={resetFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            リセット
          </button>
        </div>
      </div>
      
      {/* データテーブル */}
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">日付</th>
            <th className="border px-4 py-2">金額</th>
            <th className="border px-4 py-2">カテゴリ</th>
            <th className="border px-4 py-2">メモ</th>
            <th className="border px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <tr key={expense.id}>
                {editingId === expense.id ? (
                  // Edit mode
                  <>
                    <td className="border px-2 py-2">
                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="border px-2 py-2">
                      <input
                        type="number"
                        name="amount"
                        value={editForm.amount}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="border px-2 py-2">
                      <select 
                        name="category"
                        value={editForm.category}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded"
                      >
                        {savedCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border px-2 py-2">
                      <input
                        type="text"
                        name="memo"
                        value={editForm.memo}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="border px-2 py-2 text-center space-x-1">
                      <button
                        onClick={() => handleUpdate(expense.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                      >
                        保存
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm"
                      >
                        キャンセル
                      </button>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td className="border px-4 py-2">{expense.date ? expense.date.substring(0, 10) : ''}</td>
                    <td className="border px-4 py-2">¥{expense.amount.toLocaleString()}</td>
                    <td className="border px-4 py-2">
                      {savedCategories.find(cat => cat.id === expense.category)?.icon || ''}{' '}
                      {savedCategories.find(cat => cat.id === expense.category)?.name || expense.category}
                    </td>
                    <td className="border px-4 py-2">{expense.memo}</td>
                    <td className="border px-4 py-2 text-center space-x-1">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        削除
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="border px-4 py-6 text-center text-gray-500">
                表示するデータがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          支出を追加する
        </button>
        <button
          onClick={() => navigate('/graph')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          グラフを見る
        </button>
      </div>
    </div>
  );
};

export default Edit;