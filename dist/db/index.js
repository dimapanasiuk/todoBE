"use strict";
const { Pool } = require('pg');
const isProduction = process.env.NODE_ENV === 'production';
let dbConfig;
if (process.env.DATABASE_URL) {
    dbConfig = {
        connectionString: process.env.DATABASE_URL,
    };
}
else {
    dbConfig = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'todo',
        password: process.env.DB_PASSWORD || '0000',
        port: parseInt(process.env.DB_PORT || '5432'),
    };
}
if (isProduction || process.env.DB_SSL === 'true') {
    dbConfig.ssl = {
        rejectUnauthorized: false
    };
}
const pool = new Pool(dbConfig);
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Database connection successful');
        client.release();
    }
    catch (err) {
        console.error('❌ Database connection failed:', err);
        throw err;
    }
};
testConnection().catch(console.error);
module.exports = { pool, testConnection };
