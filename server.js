  import http from 'http';
  import app from './app.js';
  import { initializeDatabase } from './models/index.js'; // ваш index.js с initializeDatabase
  
  const PORT = process.env.PORT || 8080;
  const HOST = process.env.HOST || '0.0.0.0';
  
  async function start() {
    try {
      console.log('Initializing database...');
      // Инициализация/синхронизация БД. RECREATE_DB='true' или 'alter' управляет стилем sync.
      await initializeDatabase();
      console.log('Database initialized.');
  
      const server = http.createServer(app);
  
      server.listen(PORT, HOST, () => {
        console.log(`Server listening on http://${HOST}:${PORT}`);
      });
  
      // graceful shutdown
      const shutdown = async (signal) => {
        console.log(`Received ${signal}. Shutting down...`);
        server.close(() => {
          console.log('HTTP server closed.');
          // Если нужно — закрыть соединение с БД:
          // if (db && db.sequelize) await db.sequelize.close();
          process.exit(0);
        });
  
        // аварийный таймаут
        setTimeout(() => {
          console.error('Force exit.');
          process.exit(1);
        }, 10000).unref();
      };
  
      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));
    } catch (err) {
      console.error('Failed to start app:', err);
      process.exit(1);
    }
  }
  
  start();