import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import collectionItemsRoutes from './api/routes/collectionitems.js';
import commentsRoutes from './api/routes/comments.js';
import gameListsRoutes from './api/routes/gamelists.js';
import gamePlatformsRoutes from './api/routes/gameplatforms.js';
import gamesRoutes from './api/routes/games.js';
import listItemsRoutes from './api/routes/listitems.js';
import reviewsRoutes from './api/routes/reviews.js';
import platformsRoutes from './api/routes/platforms.js';
import usersRoutes from './api/routes/users.js';

const app = express();

// Security headers
app.use(helmet());

// Logging in non-production
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// CORS: origin from env or localhost:3000 by default
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  })
);

// Body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Optionally prefix API routes with /api — remove '/api' if you don't want the prefix
const apiPrefix = process.env.API_PREFIX || '';

app.use(`${apiPrefix}/collectionitems`, collectionItemsRoutes);
app.use(`${apiPrefix}/comments`, commentsRoutes);
app.use(`${apiPrefix}/gamelists`, gameListsRoutes);
app.use(`${apiPrefix}/gameplatforms`, gamePlatformsRoutes);
app.use(`${apiPrefix}/games`, gamesRoutes);
app.use(`${apiPrefix}/listitems`, listItemsRoutes);
app.use(`${apiPrefix}/reviews`, reviewsRoutes);
app.use(`${apiPrefix}/platforms`, platformsRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

export default app;

