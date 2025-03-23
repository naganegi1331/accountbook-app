import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Input = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedCategories, setSavedCategories] = useState([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('📝');
  const [formErrors, setFormErrors] = useState({});

  // 絵文字リスト（実際のアプリではもっと多くのオプションを提供可能）
  const emojiOptions = [
    '🍔', '🍕', '🍣', '🍜', '🍚', '🍴', '🍵', '🍷', // 食べ物・飲み物
    '🚃', '🚗', '🚕', '✈️', '🚄', '⛴️', '🚲', '🛴', // 交通
    '🎮', '🎬', '🎭', '🎨', '🎪', '🎯', '🎵', '📚', // 娯楽
    '💡', '🔌', '💦', '💵', '💴', '💰', '💳', '💸', // 光熱費・お金
    '🛍️', '👕', '👖', '👟', '👑', '👓', '👜', '💄', // ショッピング
    '💊', '🏥', '🧪', '🩺', '🦷', '🧘', '🏋️', '🤸', // 健康・医療
    '🏠', '🏢', '🏫', '🚪', '🪑', '🛏️', '🚿', '🧹', // 住居
    '📱', '💻', '⌚', '🖨️', '📷', '🎧', '📺', '📡', // 電子機器
    '📝', '📊', '📈', '📞', '📦', '🔑', '📌', '📎', // 仕事・事務
    '🎁', '🎊', '🎂', '🎄', '🎉', '🎈', '🧧', '🏆'  // イベント・ギフト
  ];

  // LocalStorageからカテゴリ一覧を読み込む
  useEffect(() => {
    const storedCategories = localStorage.getItem('expenseCategories');
    if (storedCategories) {
      setSavedCategories(JSON.parse(storedCategories));
    } else {
      // 初期カテゴリ
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
    if (!newCategory.trim()) {
      setFormErrors(prev => ({ ...prev, newCategory: 'カテゴリ名を入力してください' }));
      return;
    }
    
    // カテゴリIDが重複していないか確認
    const categoryId = newCategory.toLowerCase().replace(/\s+/g, '-');
    const categoryExists = savedCategories.some(cat => cat.id === categoryId);
    
    if (categoryExists) {
      setFormErrors(prev => ({ ...prev, newCategory: '同じ名前のカテゴリが既に存在します' }));
      return;
    }
    
    const newCategoryObj = {
      id: categoryId,
      name: newCategory,
      icon: selectedEmoji,
      custom: true
    };
    
    const updatedCategories = [...savedCategories, newCategoryObj];
    setSavedCategories(updatedCategories);
    localStorage.setItem('expenseCategories', JSON.stringify(updatedCategories));
    
    // 新規追加したカテゴリを選択状態にする
    setCategory(categoryId);
    setNewCategory('');
    setSelectedEmoji('📝');
    setIsAddingCategory(false);
    setFormErrors(prev => ({ ...prev, newCategory: null }));
    
    // 成功トースト
    showToast('新しいカテゴリを追加しました', 'success');
  };
  
  // 絵文字を選択
  const selectEmoji = (emoji) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };

  // トースト表示関数
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white p-3 rounded-lg shadow-lg z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  // 入力バリデーション
  const validateForm = () => {
    const errors = {};
    
    // 金額のバリデーション
    if (!amount) {
      errors.amount = '金額を入力してください';
    } else if (parseFloat(amount) <= 0) {
      errors.amount = '金額は0より大きい値を入力してください';
    }
    
    // カテゴリのバリデーション
    if (!category) {
      errors.category = 'カテゴリを選択してください';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 支出データの送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // バリデーションエラーがある場合
      showToast('入力内容に問題があります', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${API_URL}/api/expenses`, {
        amount: parseFloat(amount),
        category,
        memo,
        timestamp: new Date().toISOString()
      });

      showToast('追加しました', 'success');

      // フォームをリセット
      setAmount('');
      setCategory('');
      setMemo('');
      setFormErrors({});
    } catch (error) {
      console.error(error);
      showToast('データの送信に失敗しました', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // グラフ画面に移動
  const goToGraphPage = () => {
    navigate('/graph');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">支出を記録</h2>
        <div className="flex space-x-4">
          <button
            onClick={goToGraphPage}
            className="text-blue-500 hover:text-blue-700 flex items-center"
            title="支出グラフを表示"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            <span className="mr-1">グラフ</span>
          </button>
          <button
            onClick={() => navigate('/edit')}
            className="text-blue-500 hover:text-blue-700 flex items-center"
            title="履歴を表示"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="mr-1">履歴</span>
          </button>
        </div>
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
              className={`block w-full rounded-md pl-10 py-3 text-lg ${
                formErrors.amount 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (formErrors.amount) {
                  setFormErrors(prev => ({ ...prev, amount: null }));
                }
              }}
            />
          </div>
          {formErrors.amount && (
            <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
          )}
        </div>

        {/* カテゴリー選択 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">カテゴリー</label>
            <button
              type="button"
              onClick={() => {
                setIsAddingCategory(!isAddingCategory);
                setShowEmojiPicker(false);
              }}
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
            >
              {isAddingCategory ? 'キャンセル' : '新しいカテゴリ+'}
            </button>
          </div>

          {isAddingCategory ? (
            <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex mb-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex items-center justify-center h-10 w-10 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-lg"
                  >
                    {selectedEmoji}
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute z-10 mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-2 w-64">
                      <div className="grid grid-cols-8 gap-1">
                        {emojiOptions.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectEmoji(emoji)}
                            className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <input
                  type="text"
                  placeholder="新しいカテゴリ名"
                  className={`flex-1 rounded-r-md border-gray-300 py-2 ${
                    formErrors.newCategory 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  value={newCategory}
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                    if (formErrors.newCategory) {
                      setFormErrors(prev => ({ ...prev, newCategory: null }));
                    }
                  }}
                />
                
                <button
                  type="button"
                  onClick={addNewCategory}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md ml-2"
                >
                  追加
                </button>
              </div>
              
              {formErrors.newCategory && (
                <p className="text-sm text-red-600">{formErrors.newCategory}</p>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-4 gap-2 mb-2">
            {savedCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  if (formErrors.category) {
                    setFormErrors(prev => ({ ...prev, category: null }));
                  }
                }}
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
          
          {formErrors.category && (
            <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
          )}
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

      {/* グラフへの誘導メッセージ */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>支出のカテゴリ別グラフを見るには、上部の「グラフ」ボタンをクリックしてください</p>
      </div>
    </div>
  );
};

export default Input;