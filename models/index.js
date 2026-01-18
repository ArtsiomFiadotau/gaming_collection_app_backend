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
  dialect: process.env.DATABASE_DIALECT || 'mysql2',
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
      dialect: config.dialect || 'mysql2',
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
      // Указываем порядок удаления (оставляем как у вас)
      const dropOrder = [
        'CollectionItems',
        'ListItems',
        'GamePlatforms',
        'GameLists',
        'Comments',
        'Reviews',
        'Games',
        'Platforms',
        'Users',
      ];

      await sequelize.query(`SET FOREIGN_KEY_CHECKS=0;`);
      for (const tableName of dropOrder) {
        try {
          await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);
          console.log(`Dropped table (if existed): ${tableName}`);
        } catch (e) {
          console.warn(`Failed to drop table ${tableName}:`, e.message);
        }
      }
      await sequelize.query(`SET FOREIGN_KEY_CHECKS=1;`);

      // Синхронизируем модели в порядке создания (родительские сначала, дочерние потом).
      // Настройте этот список в соответствии с именами моделей, которые у вас загружены в db.
      const syncOrder = [
        // Родительские / независимые модели
        'Users',
        'Platforms',
        'Games',
        'GameLists',

        // Модели с зависимостями / дополнительные
        'Reviews',
        'Comments',

        // Таблицы many-to-many / join / дочерние
        'GamePlatforms',
        'ListItems',
        'CollectionItems',
      ];

      for (const modelName of syncOrder) {
        if (db[modelName]) {
          console.log(`Sync model (force): ${modelName}`);
          // force true чтобы пересоздать таблицу
          await db[modelName].sync({ force: true });
        } else {
          console.log(`Model not found (skipping): ${modelName}`);
        }
      }

      // На всякий случай синхронизируем оставшиеся модели, которые могли не быть в списке
      const remaining = Object.keys(db).filter((n) => !syncOrder.includes(n) && n !== 'sequelize' && n !== 'Sequelize');
      for (const modelName of remaining) {
        console.log(`Sync remaining model (force): ${modelName}`);
        await db[modelName].sync({ force: true });
      }

      console.log('Database synced by individual model order (force: true)');
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