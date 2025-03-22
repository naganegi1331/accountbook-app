// Input.jsx (modified)
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Input = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category) {
      alert('Amount and Category are required!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/expenses', {
        amount: parseInt(amount),
        category,
        memo,
      });

      alert('追加成功');
      setAmount('');
      setCategory('');
      setMemo('');
    } catch (error) {
      console.error(error);
      alert('Error submitting data');
    }
  };

  const goToEditPage = () => {
    navigate('/edit');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          placeholder="Amount"
          className="border p-2 w-full"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          className="border p-2 w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          type="text"
          placeholder="Memo (optional)"
          className="border p-2 w-full"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>

        {/* Added Edit button here */}
        <button
          type="button"
          onClick={goToEditPage}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ml-2"
        >
          Edit Expenses
        </button>
      </form>
    </div>
  );
};

export default Input;
