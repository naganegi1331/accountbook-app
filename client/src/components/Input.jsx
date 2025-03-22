import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Input = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedCategories, setSavedCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // LocalStorageからカテゴリ一覧を読み込む
  useEffect(() => {
    const storedCategories = localStorage.getItem('expenseCategories');
    if (storedCategories) {
      setSavedCategories(JSON.parse(storedCategories));
    } else {
      // 初期カテゴリ（オプション）
      const initialCategories = [
        { id: 'food', name: '食費', icon: '🍔' },
        { id: 'transport', name: '交通費', icon: '🚃' }
      ];
      localStorage.setItem('expenseCategories', JSON.stringify(initialCategories));
      setSavedCategories(initialCategories);
    }
  }, []);

  // 新しいカテゴリを追加する関数
  const addNewCategory = () => {
    if (!newCategory.trim()) return;
    
    // ランダムなアイコンを選択（実際のアプリではアイコン選択UIを実装するとよい）
    const defaultIcons = ['📝', '📦', '🏷️', '📎', '🔖', '📌', '🔍', '🔑'];
    const randomIcon = defaultIcons[Math.floor(Math.random() * defaultIcons.length)];
    
    const categoryId = newCategory.toLowerCase().replace(/\s+/g, '-');
    const newCategoryObj = {
      id: categoryId,
      name: newCategory,
      icon: randomIcon,
      custom: true
    };
    
    const updatedCategories = [...savedCategories, newCategoryObj];
    setSavedCategories(updatedCategories);
    localStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));
    
    // 新規追加したカテゴリを選択状態にする
    setCategory(categoryId);
    setNewCategory('');
    setIsAddingCategory(false);
    
    // 成功トースト
    showToast('新しいカテゴリを追加しました', 'success');
  };

  // トースト表示関数
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white p-3 rounded-lg shadow-lg z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  // 支出データの送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !category) {
      showToast('金額とカテゴリーは必須です', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post('http://localhost:5000/api/expenses', {
        amount: parseInt(amount),
        category,
        memo,
      });

      showToast('追加しました', 'success');

      // フォームをリセット
      setAmount('');
      setCategory('');
      setMemo('');
    } catch (error) {
      console.error(error);
      showToast('データの送信に失敗しました', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">支出を記録</h2>
        <button
          onClick={() => navigate('/edit')}
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <span className="mr-1">履歴</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 金額入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">¥</span>
            </div>
            <input
              type="number"
              placeholder="0"
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 py-3 text-lg"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {/* カテゴリー選択 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">カテゴリー</label>
            <button
              type="button"
              onClick={() => setIsAddingCategory(!isAddingCategory)}
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
            >
              {isAddingCategory ? 'キャンセル' : '新しいカテゴリ+'}
            </button>
          </div>

          {isAddingCategory ? (
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                placeholder="新しいカテゴリ名"
                className="flex-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button
                type="button"
                onClick={addNewCategory}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                追加
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-4 gap-2 mb-2">
            {savedCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`py-2 px-3 rounded-lg text-center transition-colors ${
                  category === cat.id 
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-500' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <div className="text-xl mb-1">{cat.icon}</div>
                <div className="text-xs truncate">{cat.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* メモ入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メモ (任意)</label>
          <textarea
            placeholder="メモを入力..."
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-2"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows="2"
          />
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow transition-colors ${
            isSubmitting 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? '処理中...' : '保存する'}
        </button>
      </form>
    </div>
  );
};

export default Input;