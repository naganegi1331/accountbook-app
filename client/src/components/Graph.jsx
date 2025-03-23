// src/components/Graph.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const Graph = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/expenses');
        const grouped = res.data.reduce((acc, curr) => {
          const category = curr.category;
          acc[category] = (acc[category] || 0) + curr.amount;
          return acc;
        }, {});

        const chartData = Object.entries(grouped).map(([key, value]) => ({
          category: key,
          amount: value,
        }));

        setData(chartData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">カテゴリ別支出グラフ</h2>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" />
          <YAxis dataKey="category" type="category" width={100} />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#3182ce" name="支出金額" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          支出を追加する
        </button>
        <button
          onClick={() => navigate('/edit')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          履歴を見る
        </button>
      </div>
    </div>
  );
};

export default Graph;

