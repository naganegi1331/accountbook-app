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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Graph = () => {
  const [expenses, setExpenses] = useState([]);
  const [viewType, setViewType] = useState('monthCategory'); // 'category', 'month', 'monthCategory'
  const [chartType, setChartType] = useState('stacked'); // 'bar', 'pie', 'line'
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or specific month (YYYY-MM)
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' or specific category
  const [processedData, setProcessedData] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const navigate = useNavigate();

  // カラーパレット
  const COLORS = [
    '#3182CE', '#38A169', '#DD6B20', '#805AD5', '#D53F8C', 
    '#2C7A7B', '#975A16', '#C53030', '#2B6CB0', '#4C51BF',
    '#667EEA', '#4FD1C5', '#F6AD55', '#9F7AEA', '#FC8181'
  ];

  useEffect(() => {
    // サーバーからデータを取得
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/expenses`);
        const data = res.data.map(expense => ({
          ...expense,
          // 日付文字列からYYYY-MM形式の月を抽出
          month: expense.date ? expense.date.substring(0, 7) : 'Unknown',
        }));
        setExpenses(data);

        // 利用可能な月を抽出 (重複なし・降順)
        const months = [...new Set(data.map(item => item.date ? item.date.substring(0, 7) : null))]
          .filter(Boolean)
          .sort((a, b) => b.localeCompare(a));
        setAvailableMonths(months);

        // 利用可能なカテゴリを抽出
        const categories = [...new Set(data.map(item => item.category))].filter(Boolean);
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Failed to fetch expense data:', error);
      }
    };

    fetchData();
  }, []);

  // カテゴリの名前を取得するヘルパー関数
  const getCategoryName = (categoryId) => {
    const storedCategories = localStorage.getItem('expenseCategories');
    if (storedCategories) {
      const categories = JSON.parse(storedCategories);
      const category = categories.find(cat => cat.id === categoryId);
      return category ? `${category.icon} ${category.name}` : categoryId;
    }
    return categoryId;
  };

  // データを選択された表示方法に基づいて処理
  useEffect(() => {
    if (expenses.length === 0) return;

    // 選択された月・カテゴリでフィルタリング
    let filteredData = [...expenses];
    
    if (selectedMonth !== 'all') {
      filteredData = filteredData.filter(item => item.month === selectedMonth);
    }
    
    if (selectedCategory !== 'all') {
      filteredData = filteredData.filter(item => item.category === selectedCategory);
    }

    let result = [];

    switch (viewType) {
      case 'category':
        // カテゴリ別の集計
        const categoryGrouped = filteredData.reduce((acc, curr) => {
          const category = curr.category;
          acc[category] = (acc[category] || 0) + curr.amount;
          return acc;
        }, {});

        result = Object.entries(categoryGrouped).map(([key, value]) => ({
          name: getCategoryName(key),
          value: value,
          category: key,
        }));
        break;

      case 'month':
        // 月別の集計
        const monthGrouped = filteredData.reduce((acc, curr) => {
          const month = curr.month;
          acc[month] = (acc[month] || 0) + curr.amount;
          return acc;
        }, {});

        result = Object.entries(monthGrouped)
          .map(([key, value]) => ({
            name: key,
            value: value,
            month: key,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)); // 月で昇順ソート
        break;

      case 'monthCategory':
        // 月+カテゴリのクロス集計
        const monthCategoryData = {};
        
        // まず利用可能な全ての月を初期化
        const availableMonthsFiltered = selectedMonth !== 'all' 
          ? [selectedMonth] 
          : [...new Set(filteredData.map(item => item.month))].sort();
          
        availableMonthsFiltered.forEach(month => {
          monthCategoryData[month] = {};
          
          // その月のカテゴリ別データを集計
          const monthExpenses = filteredData.filter(exp => exp.month === month);
          monthExpenses.forEach(exp => {
            monthCategoryData[month][exp.category] = (monthCategoryData[month][exp.category] || 0) + exp.amount;
          });
        });
        
        // チャート用のデータ形式に変換
        result = Object.entries(monthCategoryData).map(([month, categories]) => {
          const entry = { name: month };
          
          // 選択されたカテゴリのみ、または全カテゴリ
          const categoriesToInclude = selectedCategory !== 'all' 
            ? [selectedCategory] 
            : [...new Set(filteredData.map(item => item.category))];
            
          categoriesToInclude.forEach(cat => {
            entry[getCategoryName(cat)] = categories[cat] || 0;
          });
          
          return entry;
        }).sort((a, b) => a.name.localeCompare(b.name)); // 月で昇順ソート
        break;
      
      default:
        result = [];
    }

    setProcessedData(result);
  }, [expenses, viewType, selectedMonth, selectedCategory]);

  // 金額フォーマット用のヘルパー関数
  const formatCurrency = (value) => {
    return `¥${value.toLocaleString()}`;
  };

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 表示するチャートを選択
  const renderChart = () => {
    if (processedData.length === 0) {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">データがありません</p>
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return renderBarChart();
      case 'stacked':
        return renderStackedBarChart();
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      default:
        return renderBarChart();
    }
  };

  // 棒グラフの描画
  const renderBarChart = () => {
    // カテゴリ別または月別の単純な棒グラフ
    if (viewType === 'category' || viewType === 'month') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={processedData}
            layout={viewType === 'category' ? 'vertical' : 'horizontal'}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            {viewType === 'category' ? (
              <>
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis dataKey="name" type="category" width={150} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis tickFormatter={formatCurrency} />
              </>
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="value"
              fill="#3182CE"
              name="支出金額"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    // 月+カテゴリのクロス集計グラフ（グループ化された棒グラフ）
    const dataKeys = processedData.length > 0
      ? Object.keys(processedData[0]).filter(key => key !== 'name')
      : [];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 積み上げ棒グラフの描画 (新規追加)
  const renderStackedBarChart = () => {
    // カテゴリ別では積み上げ棒グラフを表示できない
    if (viewType === 'category') {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">カテゴリ別では積み上げ棒グラフを表示できません。別の表示タイプを選択してください。</p>
        </div>
      );
    }
    
    // 月別の単純な棒グラフの場合、通常の棒グラフと同じになるので警告を表示
    if (viewType === 'month') {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">月別では「月別×カテゴリ別」を選択すると積み上げ棒グラフが表示できます</p>
        </div>
      );
    }
    
    // 月+カテゴリのクロス集計グラフ（積み上げ棒グラフ）
    const dataKeys = processedData.length > 0
      ? Object.keys(processedData[0]).filter(key => key !== 'name')
      : [];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 円グラフの描画
  const renderPieChart = () => {
    // 月+カテゴリのクロス集計の場合は最初の月のデータだけ使用
    let pieData = processedData;
    
    if (viewType === 'monthCategory' && processedData.length > 0) {
      const firstMonth = processedData[0];
      pieData = Object.entries(firstMonth)
        .filter(([key]) => key !== 'name')
        .map(([key, value]) => ({ name: key, value }));
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 折れ線グラフの描画
  const renderLineChart = () => {
    // カテゴリ別の場合は折れ線グラフを表示しない
    if (viewType === 'category') {
      return (
        <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">カテゴリ別では折れ線グラフを表示できません</p>
        </div>
      );
    }

    // 月別の単純な折れ線グラフ
    if (viewType === 'month') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3182CE"
              name="支出金額"
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // 月+カテゴリのクロス集計折れ線グラフ
    const dataKeys = processedData.length > 0
      ? Object.keys(processedData[0]).filter(key => key !== 'name')
      : [];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[index % COLORS.length]}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">支出分析グラフ</h2>

      {/* グラフコントロールパネル */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 表示タイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">表示タイプ</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
            >
              <option value="category">カテゴリ別</option>
              <option value="month">月別</option>
              <option value="monthCategory">月別×カテゴリ別</option>
            </select>
          </div>

          {/* グラフタイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">グラフタイプ</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">棒グラフ</option>
              <option value="stacked">積み上げ棒グラフ</option>
              <option value="pie">円グラフ</option>
              <option value="line">折れ線グラフ</option>
            </select>
          </div>

          {/* 月フィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">月フィルタ</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリフィルタ</label>
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
      </div>

      {/* グラフ表示エリア */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        {renderChart()}
      </div>

      {/* 合計金額表示 */}
      <div className="bg-blue-50 p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium text-blue-800 mb-2">集計サマリー</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded shadow-sm">
            <p className="text-sm text-gray-500">選択中の合計金額</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(processedData.reduce((sum, item) => {
                if (viewType === 'monthCategory') {
                  // monthCategory の場合は、カテゴリ名のプロパティ値を合計
                  const categoryValues = Object.entries(item)
                    .filter(([key]) => key !== 'name')
                    .reduce((catSum, [, value]) => catSum + Number(value), 0);
                  return sum + categoryValues;
                }
                return sum + Number(item.value);
              }, 0))}
            </p>
          </div>
          
          <div className="bg-white p-3 rounded shadow-sm">
            <p className="text-sm text-gray-500">データ件数</p>
            <p className="text-xl font-bold text-blue-600">
              {viewType === 'monthCategory' ? processedData.length : processedData.length}
            </p>
          </div>
          
          <div className="bg-white p-3 rounded shadow-sm">
            <p className="text-sm text-gray-500">平均金額</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(processedData.length === 0 ? 0 : 
                processedData.reduce((sum, item) => {
                  if (viewType === 'monthCategory') {
                    // monthCategory の場合は、カテゴリ名のプロパティ値を合計
                    const categoryValues = Object.entries(item)
                      .filter(([key]) => key !== 'name')
                      .reduce((catSum, [, value]) => catSum + Number(value), 0);
                    return sum + categoryValues;
                  }
                  return sum + Number(item.value);
                }, 0) / (viewType === 'monthCategory' ? Math.max(1, processedData.length) : Math.max(1, processedData.length))
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ナビゲーションボタン */}
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