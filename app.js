import express from 'express';
import cors from 'cors';
const app = express();
import { urlencoded, json } from 'body-parser';

import collectionItemsRoutes from './api/routes/collectionitems';
import commentsRoutes from './api/routes/comments';
import gameListsRoutes from './api/routes/gamelists';
import gamePlatformsRoutes from './api/routes/gameplatforms';
import gamesRoutes from './api/routes/games';
import listItemsRoutes from './api/routes/listitems';
import reviewsRoutes from './api/routes/reviews';
import platformsRoutes from './api/routes/platforms';
import usersRoutes from './api/routes/users';

app.use(cors({
    origin: 'http://localhost:3000', // для разрешения запросов со всех фронтовых приложений; замените на конкретный origin для безопасности
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(urlencoded({extended: false}));
app.use(json());

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//     if (req.method === 'OPTIONS') {
//         res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
//         return res.status(200).json({});
//     }
//     next();
// });

app.use('/collectionitems', collectionItemsRoutes);
app.use('/comments', commentsRoutes);
app.use('/gamelists', gameListsRoutes);
app.use('/gameplatforms', gamePlatformsRoutes);
app.use('/games', gamesRoutes);
app.use('/listitems', listItemsRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/platforms', platformsRoutes);
app.use('/users', usersRoutes);


app.use((req, res, next) => {
    const err = new Error('Not found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

export default app;