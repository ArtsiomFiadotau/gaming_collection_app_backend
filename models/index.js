import fs from 'fs';  
import path from 'path';  
import { Sequelize } from 'sequelize';  
import { fileURLToPath, pathToFileURL } from 'url';  

const __filename = fileURLToPath(import.meta.url);  
const __dirname = path.dirname(__filename);  

const env = process.env.NODE_ENV || 'development';  
const configPath = path.join(__dirname, '/../config/config.json');  
const rawConfig = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};  
const config = rawConfig[env] || {  
  username: process.env.DATABASE_USER,  
  password: process.env.DATABASE_PASSWORD,  
  database: process.env.DATABASE_NAME,  
  host: process.env.DATABASE_HOST,  
  dialect: process.env.DATABASE_DIALECT || 'mysql',  
};  

let sequelize;  
const db = {};  

export async function initializeDatabase() {  
  if (sequelize) return db;  

  // Создаём экземпляр Sequelize  
  if (config.use_env_variable && process.env[config.use_env_variable]) {  
    sequelize = new Sequelize(process.env[config.use_env_variable], { logging: false });  
  } else {  
    sequelize = new Sequelize(config.database, config.username, config.password, {  
      host: config.host,  
      dialect: config.dialect || 'mysql',  
      logging: false,  
    });  
  }  

  // Загружаем все модели в папке models  
  const files = fs.readdirSync(__dirname).filter((f) => f !== path.basename(__filename) && f.endsWith('.js'));  

  for (const file of files) {  
    const fullPath = path.join(__dirname, file);  
    const mod = await import(pathToFileURL(fullPath).href);  
    const define = mod.default || mod;  
    if (typeof define === 'function') {  
      const model = define(sequelize, Sequelize.DataTypes);  
      if (model && model.name) db[model.name] = model;  
    }  
  }  

  // Вызов associate для всех моделей (чтобы связи были зарегистрированы)  
  Object.keys(db).forEach((name) => {  
    if (typeof db[name].associate === 'function') {  
      db[name].associate(db);  
    }  
  });  

  db.sequelize = sequelize;  
  db.Sequelize = Sequelize;  

  // Опция пересоздания: 'true' => force, 'alter' => alter  
  const recreate = process.env.RECREATE_DB; // 'true' | 'alter' | undefined  

  try {  
    if (recreate === 'true') {  
      console.log('RECREATE_DB=true -> dropping tables in proper order and syncing with force');  

      // Явно удалить зависимые таблицы перед sync, чтобы избежать ошибок внешних ключей  
      // Указываем порядок: сначала таблицы с FKs (ListItems), потом родительские (GameLists, Games, Users и т.д.)  
      // Если у вас список моделей другой — добавьте/измените имена.  
      const dropOrder = [  
        'CollectionItems',
        'ListItems', 
        'Games', 
        'Platforms',
        'Users',  
        'GamePlatform',
        'GameLists',  
        'Comments',
        'Reviews',      
       
       
        // добавьте остальные таблицы при необходимости  
      ];  

      for (const tableName of dropOrder) {  
        try {  
          // raw query безопасно игнорирует отсутствие таблицы  
          await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);  
          console.log(`Dropped table (if existed): ${tableName}`);  
        } catch (e) {  
          console.warn(`Failed to drop table ${tableName}:`, e.message);  
        }  
      }  

      // После ручного удаления делаем sync force  
      await sequelize.sync({ force: true });  
      console.log('Database synced with force: true');  
    } else if (recreate === 'alter') {  
      console.log('RECREATE_DB=alter -> syncing with alter');  
      await sequelize.sync({ alter: true });  
      console.log('Database synced with alter: true');  
    } else {  
      console.log('Regular sequelize.sync()');  
      await sequelize.sync();  
      console.log('Database synced');  
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