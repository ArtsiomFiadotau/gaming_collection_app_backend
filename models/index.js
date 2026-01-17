// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const process = require('process');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.json')[env];
// const db = {};

// if (process.env.NODE_ENV !== 'production') {
//   await sequelize.sync();
// }

// let sequelize;
// console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
// console.log('DATABASE_PORT:', process.env.DATABASE_PORT);
// console.log('DATABASE_NAME:', process.env.DATABASE_NAME);
// console.log('DATABASE_USER:', process.env.DATABASE_USER);
// console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD);

// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], {
//     host: process.env['DATABASE_HOST'],
//     port: process.env['DATABASE_PORT'],
//     dialect: 'mysql2',
//     database: process.env['DATABASE_NAME'],
//     username: process.env['DATABASE_USER'],
//     password: process.env['DATABASE_PASSWORD']
//   });
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       file.indexOf('.test.js') === -1
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;

'use strict';

import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import process from 'process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || 'development';

// Загрузка конфигурации
const configPath = path.join(__dirname, '/../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))[env];

const basename = path.basename(__filename);
const db = {};

let sequelize;

/**
 * Инициализация базы данных
 */
async function init() {
  // Создаем соединение Sequelize
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      dialect: 'mysql2',
      database: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    });
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }

  // Подключение моделей
  const files = fs.readdirSync(__dirname);
  
  for (const file of files) {
    if (
      file.startsWith('.') || // пропускаем скрытые файлы
      file === basename || // текущий файл
      path.extname(file) !== '.js' || // только .js
      file.endsWith('.test.js') // исключаем тестовые файлы
    ) {
      continue;
    }
    const modelModule = await import(path.join(__dirname, file));
    const model = modelModule.default
      ? modelModule.default(sequelize, Sequelize.DataTypes)
      : modelModule(sequelize, Sequelize.DataTypes);
    if (model && model.name) {
      db[model.name] = model;
    }
  }

  // Объединение ассоциаций
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  // Создаем таблицы, если нужно
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync();
  }
}

// Запускаем инициализацию
init().catch((err) => {
  console.error('Ошибка при инициализации базы данных:', err);
});

export default db;
