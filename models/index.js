'use strict';  

import fs from 'fs';  
import path from 'path';  
import { Sequelize } from 'sequelize';  
import { dirname } from 'path';  
import { fileURLToPath, pathToFileURL } from 'url';  

const __filename = fileURLToPath(import.meta.url);  
const __dirname = dirname(__filename);  

const env = process.env.NODE_ENV || 'development';  
const configPath = path.join(__dirname, '/../config/config.json');  
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))[env];  

const basename = path.basename(__filename);  
const db = {};  

let sequelize = null;  

/**  
 * Инициализация базы данных и загрузка моделей.  
 * Возвращает объект db.  
 * Опция RECREATE_DB:  
 *  - 'true'  -> force: true (удалит и создаст таблицы)  
 *  - 'alter' -> alter: true (поправит схему без удаления данных)  
 *  - любая другая/отсутствует -> обычный sync без изменений  
 */  
export async function initializeDatabase() {  
  if (sequelize) return db; // уже инициализировано  

  if (config.use_env_variable) {  
    const connectionString = process.env[config.use_env_variable];  
    sequelize = new Sequelize(connectionString, {  
      host: process.env.DATABASE_HOST,  
      port: process.env.DATABASE_PORT,  
      dialect: 'mysql',  
      database: process.env.DATABASE_NAME,  
      username: process.env.DATABASE_USER,  
      password: process.env.DATABASE_PASSWORD,  
      logging: false,  
    });  
  } else {  
    sequelize = new Sequelize(config.database, config.username, config.password, {  
      ...config,  
      logging: false,  
    });  
  }  

  const files = fs.readdirSync(__dirname);  
  for (const file of files) {  
    if (  
      file === basename ||  
      file.startsWith('.') ||  
      path.extname(file) !== '.js' ||  
      file.endsWith('.test.js')  
    ) continue;  

    const fullPath = path.join(__dirname, file);  
    const moduleUrl = pathToFileURL(fullPath).href;  
    const modelModule = await import(moduleUrl);  

    const defineModel = modelModule.default || modelModule;  
    const model = typeof defineModel === 'function'  
      ? defineModel(sequelize, Sequelize.DataTypes)  
      : null;  

    if (model && model.name) {  
      db[model.name] = model;  
    }  
  }  

  Object.keys(db).forEach((modelName) => {  
    if (db[modelName].associate) {  
      db[modelName].associate(db);  
    }  
  });  

  db.sequelize = sequelize;  
  db.Sequelize = Sequelize;  

  // Определяем стратегию синхронизации  
  const recreate = process.env.RECREATE_DB; // 'true' | 'alter' | undefined  
  try {  
    if (recreate === 'true') {  
      console.log('Database sync: force true (dropping and recreating tables)');  
      await sequelize.sync({ force: true });  
    } else if (recreate === 'alter') {  
      console.log('Database sync: alter true (migrating tables)');  
      await sequelize.sync({ alter: true });  
    } else {  
      console.log('Database sync: regular sync()');  
      await sequelize.sync();  
    }  
  } catch (err) {  
    console.error('Failed to sync database:', err);  
    throw err;  
  }  

  return db;  
}  

export function getDB() {  
  return db;
}