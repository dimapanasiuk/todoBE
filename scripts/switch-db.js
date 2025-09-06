#!/usr/bin/env node

/**
 * Скрипт для переключения между локальной и удаленной базой данных
 * Использование: node scripts/switch-db.js [local|remote]
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

// Конфигурации для разных сред
const configs = {
  local: {
    NODE_ENV: 'development',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_NAME: 'todo',
    DB_USER: 'postgres',
    DB_PASSWORD: '0000',
    // DB_SSL не указываем для локальной базы
  },
  remote: {
    NODE_ENV: 'development',
    DB_HOST: 'dpg-d2u7d5ffte5s73at41gg-a.oregon-postgres.render.com',
    DB_PORT: '5432',
    DB_NAME: 'todo_i2ce',
    DB_USER: 'todo_i2ce_user',
    DB_PASSWORD: 'bKvXNHlTowxF3c6pMMssEdt3vknD298g',
    DB_SSL: 'true',
  }
};

// JWT секреты (одинаковые для всех сред)
const jwtSecrets = {
  JWT_SECRET: '810faf7d47f35fb297dcc846537c94621d4157cf57c99d755dc839bcbfde7815e82f5d453a357f17806ac45c2b27ab3f1d98b853ab1ee862bbfddb34657d8cd9',
  JWT_REFRESH_SECRET: 'c14a38fffebba2325c55bedec55e0ebcd5fb7c5f4c5f42cb9077410e583df26b7b4b9f32787963d9266c7e3c0e2e47c0a54e5c0e46794c0f432a1b438e0dcee6'
};

// Общие настройки
const commonSettings = {
  PORT: '5000',
  CORS_ORIGIN: 'http://localhost:3001'
};

function createEnvFile(config) {
  // Создаем структурированный .env файл
  const envSections = [
    '# Режим работы приложения',
    `NODE_ENV=${config.NODE_ENV}`,
    '',
    '# Настройки базы данных',
    `DB_HOST=${config.DB_HOST}`,
    `DB_PORT=${config.DB_PORT}`,
    `DB_NAME=${config.DB_NAME}`,
    `DB_USER=${config.DB_USER}`,
    `DB_PASSWORD=${config.DB_PASSWORD}`,
    config.DB_SSL ? `DB_SSL=${config.DB_SSL}` : '',
    '',
    '# JWT настройки',
    `JWT_SECRET=${jwtSecrets.JWT_SECRET}`,
    `JWT_REFRESH_SECRET=${jwtSecrets.JWT_REFRESH_SECRET}`,
    '',
    '# Настройки сервера',
    `PORT=${commonSettings.PORT}`,
    '',
    '# CORS настройки',
    `CORS_ORIGIN=${commonSettings.CORS_ORIGIN}`
  ];

  // Убираем пустые строки
  const envContent = envSections.filter(line => line !== '').join('\n') + '\n';

  fs.writeFileSync(envPath, envContent);
  
  const dbType = config === configs.local ? 'локальной' : 'удаленной (render.com)';
  console.log(`✅ .env файл создан для ${dbType} базы данных`);
}

function showUsage() {
  console.log('Использование:');
  console.log('  node scripts/switch-db.js local   - переключиться на локальную базу данных');
  console.log('  node scripts/switch-db.js remote  - переключиться на удаленную базу данных (render.com)');
  console.log('');
  console.log('Примеры:');
  console.log('  node scripts/switch-db.js local');
  console.log('  node scripts/switch-db.js remote');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Не указан режим работы');
    showUsage();
    process.exit(1);
  }

  const mode = args[0].toLowerCase();

  console.log('🔄 Переключение конфигурации базы данных...\n');

  if (mode === 'local') {
    createEnvFile(configs.local);
    console.log('\n📝 Следующие шаги для локальной разработки:');
    console.log('   1. Запустите локальную базу данных:');
    console.log('      docker build -f Dockerfile.db -t todo-db .');
    console.log('      docker run -p 5432:5432 todo-db');
    console.log('   2. Инициализируйте базу данных (если нужно):');
    console.log('      npm run init-db');
    console.log('   3. Запустите приложение:');
    console.log('      npm run dev');
  } else if (mode === 'remote') {
    createEnvFile(configs.remote);
    console.log('\n📝 Конфигурация для удаленной базы данных (render.com):');
    console.log('   ✅ Хост: dpg-d2u7d5ffte5s73at41gg-a.oregon-postgres.render.com');
    console.log('   ✅ База данных: todo_i2ce');
    console.log('   ✅ Пользователь: todo_i2ce_user');
    console.log('   ✅ SSL: включен');
    console.log('\n🚀 Теперь можете запустить приложение:');
    console.log('   npm run dev');
  } else {
    console.log(`❌ Неизвестный режим: ${mode}`);
    showUsage();
    process.exit(1);
  }

  console.log('\n💡 Полезные команды:');
  console.log('   npm run db:local  - переключиться на локальную БД');
  console.log('   npm run db:remote - переключиться на удаленную БД');
}

main();
