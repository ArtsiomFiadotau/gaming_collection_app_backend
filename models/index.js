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

// нормализация имени для поиска
function normalizeName(n) {
  return (n || '').toString().toLowerCase();
}

// ищем модель по имени модели или по tableName, пробуем варианты plural/singular
function findModel(dbObj, desired) {
  if (!desired) return null;
  const want = normalizeName(desired);

  for (const key of Object.keys(dbObj)) {
    const m = dbObj[key];
    if (!m) continue;
    if (m.name && normalizeName(m.name) === want) return m;
    const table = typeof m.getTableName === 'function' ? m.getTableName() : (m.tableName || '');
    if (table && normalizeName(table) === want) return m;
  }

  // простая попытка добавить/убрать 's'
  const alt = want.endsWith('s') ? want.slice(0, -1) : `${want}s`;
  for (const key of Object.keys(dbObj)) {
    const m = dbObj[key];
    if (!m) continue;
    if (m.name && normalizeName(m.name) === alt) return m;
    const table = typeof m.getTableName === 'function' ? m.getTableName() : (m.tableName || '');
    if (table && normalizeName(table) === alt) return m;
  }

  return null;
}

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

  // Диагностика: какие модели загружены
  console.log('Loaded model keys:', Object.keys(db));
  for (const k of Object.keys(db)) {
    const m = db[k];
    try {
      const table = typeof m.getTableName === 'function' ? m.getTableName() : (m.tableName || '(no tableName)');
      console.log(`  model key="${k}", model.name="${m.name}", tableName="${table}"`);
    } catch (e) {
      console.log(`  model key="${k}", model.name="${m && m.name}" (error reading tableName)`);
    }
  }

  // Опция пересоздания: 'true' => force, 'alter' => alter
  const recreate = process.env.RECREATE_DB; // 'true' | 'alter' | undefined

  try {
    if (recreate === 'true') {
      console.log('RECREATE_DB=true -> dropping tables in proper order and syncing with force');

      // Порядок удаления TABLES (оставляем ваш порядок)
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

      // Явный порядок синхронизации (подстроен под ваши реальные model.name из логов)
      // Можно менять порядок при добавлении/изменении моделей.
      const syncOrder = [
        'User',          // ожидается model.name === 'User', tableName 'Users'
        'Game',          // model.name 'Game'
        'GameList',      // model.name 'GameList'
        'Review',        // model.name 'Review'
        'Comment',       // model.name 'Comment'
        'ListItem',      // join
        'CollectionItem' // join / child
      ];

      const syncedNames = new Set();

      // синхронизируем по списку, находя модель гибко
      for (const entry of syncOrder) {
        const model = findModel(db, entry);
        if (model) {
          console.log(`Sync model (force): ${model.name} (requested: ${entry})`);
          await model.sync({ force: true });
          syncedNames.add(model.name);
        } else {
          console.log(`Model not found (skipping): ${entry}`);
        }
      }

      // синхронизируем оставшиеся модели, которых не было в syncOrder
      const remaining = Object.keys(db).filter((k) => k !== 'sequelize' && k !== 'Sequelize' && !syncedNames.has(k));
      for (const modelName of remaining) {
        const model = db[modelName];
        if (!model) continue;
        console.log(`Sync remaining model (force): ${model.name}`);
        await model.sync({ force: true });
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