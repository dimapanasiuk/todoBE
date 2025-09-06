
/**
 * Скрипт для инициализации базы данных на render.com
 * Запускается один раз после создания базы данных
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Конфигурация подключения к базе данных
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false // Для render.com PostgreSQL
  }
};

const pool = new Pool(dbConfig);

async function initDatabase() {
  let client;
  
  try {
    console.log('🔄 Подключение к базе данных...');
    client = await pool.connect();
    console.log('✅ Подключение успешно!');

    // Читаем SQL скрипт инициализации
    const initScriptPath = path.join(__dirname, '..', 'init-db.sql');
    const initScript = fs.readFileSync(initScriptPath, 'utf8');

    console.log('🔄 Выполнение скрипта инициализации...');
    await client.query(initScript);
    console.log('✅ База данных успешно инициализирована!');

    // Проверяем созданные таблицы
    console.log('🔄 Проверка созданных таблиц...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Созданные таблицы:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Проверяем тестового пользователя
    const userResult = await client.query('SELECT username, email FROM users WHERE username = $1', ['admin']);
    if (userResult.rows.length > 0) {
      console.log('👤 Тестовый пользователь создан:', userResult.rows[0]);
    }

  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Запускаем инициализацию
initDatabase();
