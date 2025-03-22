// src/components/Graph.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';

const Graph = () => {
  const [data, setData] = useState([]);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/expenses');

      // Aggregate data by category
      const aggregate = {};
      res.data.forEach(({ category, amount }) => {
        if (aggregate[category]) {
          aggregate[category] += amount;
        } else {
          aggregate[category] = amount;
        }
      });

      // Prepare data for PieChart
      const chartData = Object.entries(aggregate).map(([name, value]) => ({
        name,
        value,
      }));

      setData(chartData);
    } catch (error) {
      console.error(error);
      alert('Error fetching data');
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6699"];

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Expense Breakdown by Category</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default Graph;
