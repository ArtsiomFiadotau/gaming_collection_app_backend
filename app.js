import express from 'express';
import cors from 'cors';
import collectionItemsRoutes from './api/routes/collectionitems.js';
import commentsRoutes from './api/routes/comments.js';
import gameListsRoutes from './api/routes/gamelists.js';
import gamesRoutes from './api/routes/games.js';
import listItemsRoutes from './api/routes/listitems.js';
import reviewsRoutes from './api/routes/reviews.js';
import usersRoutes from './api/routes/users.js';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/collectionitems', collectionItemsRoutes);
app.use('/comments', commentsRoutes);
app.use('/gamelists', gameListsRoutes);
app.use('/games', gamesRoutes);
app.use('/listitems', listItemsRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/users', usersRoutes);

app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message,
    },
  });
});

export default app;
