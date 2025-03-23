// database.js - SQLiteとPostgreSQL両対応
const isProduction = process.env.NODE_ENV === 'production';

let db;

if (isProduction) {
  // PostgreSQL設定（本番環境用）
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  // テーブル初期化
  pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      amount INTEGER,
      category TEXT,
      memo TEXT
    )
  `).catch(err => console.error('PostgreSQL初期化エラー:', err));
  
  // SQLite互換APIを提供するラッパー
  db = {
    all: async (query, params, callback) => {
      try {
        // SQLiteのクエリをPostgreSQL用に調整
        const pgQuery = query
          .replace(/date\('now','localtime'\)/g, 'CURRENT_TIMESTAMP')
          .replace(/ORDER BY date DESC/g, 'ORDER BY date DESC');
        
        const result = await pool.query(pgQuery, params);
        callback(null, result.rows);
      } catch (err) {
        console.error('PostgreSQL query error:', err);
        callback(err);
      }
    },
    
    run: async (query, params, callback) => {
      try {
        // SQLiteのクエリをPostgreSQL用に調整
        const pgQuery = query
          .replace(/date\('now','localtime'\)/g, 'CURRENT_TIMESTAMP');
        
        await pool.query(pgQuery, params);
        callback && callback(null);
      } catch (err) {
        console.error('PostgreSQL run error:', err);
        callback && callback(err);
      }
    }
  };
} else {
  // SQLite設定（開発環境用）
  const sqlite3 = require('sqlite3').verbose();
  const sqliteDb = new sqlite3.Database('./expenses.db');
  
  sqliteDb.serialize(() => {
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT DEFAULT (date('now','localtime')),
      amount INTEGER,
      category TEXT,
      memo TEXT
    )`);
  });
  
  db = sqliteDb;
}

module.exports = db;