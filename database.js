// database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./expenses.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now','localtime')),
    amount INTEGER,
    category TEXT,
    memo TEXT
  )`);
});

module.exports = db;
