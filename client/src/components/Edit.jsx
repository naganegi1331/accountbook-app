// src/components/Edit.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Edit = () => {
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    amount: '',
    category: '',
    memo: ''
  });
  const navigate = useNavigate();

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/expenses');
      setExpenses(res.data);
    } catch (error) {
      console.error(error);
      alert('Error fetching data');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`);
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
      await axios.put(`http://localhost:5000/api/expenses/${id}`, editForm);
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">編集・履歴</h2>
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
          {expenses.map((expense) => (
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
                  <td className="border px-4 py-2">{expense.date}</td>
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
          ))}
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