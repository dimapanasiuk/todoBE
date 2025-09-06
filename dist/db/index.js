"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { Pool } = require('pg');
// Определяем режим работы
const isProduction = process.env.NODE_ENV === 'production';
// Конфигурация для подключения к базе данных
let dbConfig;
// Если есть полная строка подключения, используем её
if (process.env.DATABASE_URL) {
    dbConfig = {
        connectionString: process.env.DATABASE_URL,
    };
}
else {
    // Иначе используем отдельные параметры
    dbConfig = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'todo',
        password: process.env.DB_PASSWORD || '0000',
        port: parseInt(process.env.DB_PORT || '5432'),
    };
}
// Для продакшена добавляем SSL настройки (требуется для render.com)
if (isProduction || process.env.DB_SSL === 'true') {
    dbConfig.ssl = {
        rejectUnauthorized: false // Для render.com PostgreSQL
    };
}
const pool = new Pool(dbConfig);
// Обработка ошибок подключения
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
// Функция для проверки подключения к базе данных
const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield pool.connect();
        console.log('✅ Database connection successful');
        client.release();
    }
    catch (err) {
        console.error('❌ Database connection failed:', err);
        throw err;
    }
});
// Тестируем подключение при запуске
testConnection().catch(console.error);
module.exports = { pool, testConnection };
