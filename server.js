// server.js（修正版）
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const db = require('./database');

// 基本のルート（動作確認用）
app.get('/', (req, res) => res.send('サーバ起動成功'));

// 支出追加API
app.post('/api/expenses', (req, res) => {
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
});

// 支出一覧取得API
app.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses ORDER BY date DESC', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: err.message });
    }
    res.send(rows);
  });
});

// 支出削除API
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM expenses WHERE id = ?', [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: err.message });
    }
    res.send({ message: 'Deleted successfully' });
  });
});

// ★ 必ずすべてのルート定義の後に書くこと
app.listen(port, () => console.log(`Server running on port ${port}`));
