const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

const collectionItemsRoutes = require('./api/routes/collectionitems').default;
const commentsRoutes = require('./api/routes/comments').default;
const gameListsRoutes = require('./api/routes/gamelists').default;
const gamePlatformsRoutes = require('./api/routes/gameplatforms').default;
const gamesRoutes = require('./api/routes/games').default;
const listItemsRoutes = require('./api/routes/listitems').default;
const reviewsRoutes = require('./api/routes/reviews').default;
const platformsRoutes = require('./api/routes/platforms').default;
const usersRoutes = require('./api/routes/users').default;

app.use(cors({
    origin: 'http://localhost:3000', // для разрешения запросов со всех фронтовых приложений; замените на конкретный origin для безопасности
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

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

module.exports = app;