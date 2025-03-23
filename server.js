// server.js
require('dotenv').config(); // ローカル環境変数の読み込み
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

const db = require('./database');

// 基本のルート（動作確認用）
app.get('/', (req, res) => res.send('サーバ起動成功'));

// 支出追加API
app.post('/api/expenses', (req, res) => {
  try {
    const { amount, category, memo } = req.body;
    db.run(
      'INSERT INTO expenses (amount, category, memo) VALUES (?, ?, ?)',
      [amount, category, memo],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ error: err.message });
        }
        res.status(201).send({ message: '追加成功' });
      }
    );
  } catch (error) {
    console.error('支出追加エラー:', error);
    res.status(500).send({ error: error.message });
  }
});

// 支出一覧取得API
app.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: err.message });
    }
    res.send(rows);
  });
});

// 支出削除API
app.delete('/api/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM expenses WHERE id = ?', [id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ error: err.message });
      }
      res.send({ message: 'Deleted successfully' });
    });
  } catch (error) {
    console.error('支出削除エラー:', error);
    res.status(500).send({ error: error.message });
  }
});

// 支出更新API
app.put('/api/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, category, memo } = req.body;
    
    db.run(
      'UPDATE expenses SET date = ?, amount = ?, category = ?, memo = ? WHERE id = ?',
      [date, amount, category, memo, id],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ error: err.message });
        }
        res.send({ message: 'Updated successfully' });
      }
    );
  } catch (error) {
    console.error('支出更新エラー:', error);
    res.status(500).send({ error: error.message });
  }
});

// ★ 必ずすべてのルート定義の後に書くこと
app.listen(port, () => console.log(`Server running on port ${port}`));