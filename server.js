import { createServer } from 'http';
import app from './app.js';
import { initializeDatabase } from './models/index.js';
const port = process.env.PORT || 1537;

await initializeDatabase();

if (process.env.NODE_ENV !== 'production') {
  await db.sequelize.sync();
}

const server = createServer(app);

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });