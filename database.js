// database.js - PostgreSQL設定
const { Pool } = require('pg');

// 環境変数から接続情報を取得するか、デフォルト値を使用
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = isProduction 
  ? process.env.DATABASE_URL 
  : 'postgresql://postgres:1331@localhost:5432/expenses_db';

// PostgreSQLプールの設定
const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// テーブル初期化
const initializeDatabase = async () => {
  try {
    // expenses テーブルの作成
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        amount NUMERIC NOT NULL,
        category TEXT NOT NULL,
        memo TEXT
      )
    `);
    console.log('データベーステーブルの初期化が完了しました');
  } catch (error) {
    console.error('データベース初期化エラー:', error);
  }
};

// 初期化を実行
initializeDatabase();

// SQLite互換APIを提供するラッパー
const db = {
  all: async (query, params = [], callback) => {
    try {
      // SQLのプレースホルダーを変換（?を$1, $2, ...に）
      let pgQuery = query;
      let paramCount = 0;
      pgQuery = pgQuery.replace(/\?/g, () => `$${++paramCount}`);
      
      const result = await pool.query(pgQuery, params);
      if (typeof callback === 'function') {
        callback(null, result.rows);
      }
      return result.rows;
    } catch (err) {
      console.error('PostgreSQL query error:', err);
      if (typeof callback === 'function') {
        callback(err);
      }
      throw err;
    }
  },
  
  run: async (query, params = [], callback) => {
    try {
      // SQLのプレースホルダーを変換（?を$1, $2, ...に）
      let pgQuery = query;
      let paramCount = 0;
      pgQuery = pgQuery.replace(/\?/g, () => `$${++paramCount}`);
      
      const result = await pool.query(pgQuery, params);
      if (typeof callback === 'function') {
        callback(null);
      }
      return result;
    } catch (err) {
      console.error('PostgreSQL run error:', err);
      if (typeof callback === 'function') {
        callback(err);
      }
      throw err;
    }
  }
};

module.exports = db;