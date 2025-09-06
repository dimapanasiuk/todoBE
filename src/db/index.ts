const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',           // пользователь PostgreSQL
  host: process.env.DB_HOST || 'localhost',          // хост
  database: process.env.DB_NAME || 'todo',           // имя базы
  password: process.env.DB_PASSWORD || '0000',       // пароль
  port: parseInt(process.env.DB_PORT || '5432'),     // порт PostgreSQL
});

module.exports = pool;