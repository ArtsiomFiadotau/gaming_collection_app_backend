import validator from 'fastest-validator';
import { getDB } from '../../models/index.js';

function getGameListModel() {
    const db = getDB();
    if (!db || !db.GameList) {
      throw new Error('Database not initialized. GameList model not available.');
    }
    return db.GameList;
}

function getUserModel() {
    const db = getDB();
    if (!db || !db.User) {
      throw new Error('Database not initialized. User model not available.');
    }
    return db.User;
}

function getListItemModel() {
    const db = getDB();
    if (!db || !db.ListItem) {
      throw new Error('Database not initialized. ListItem model not available.');
    }
    return db.ListItem;
}

function getGameModel() {
    const db = getDB();
    if (!db || !db.Game) {
      throw new Error('Database not initialized. Game model not available.');
    }
    return db.Game;
}

async function gamelists_get_all(req, res, next){
    try {
        const GameList = getGameListModel();
        const User = getUserModel();
        const Game = getGameModel();
        
        const docs = await GameList.findAll({
            include: [
            {
                model: User,
                attributes: ['userName']
            },
            {
                model: Game,
                through: {
                    attributes: []
                },
                attributes: ['gameId', 'title', 'coverImage']
            }]
        });
        
        const response = {
         count: docs.length,
         gamelists: docs.map(doc => {
             const games = doc.Games || [];
             return {
                listId: doc.listId,
                listTitle: doc.listTitle,
                userName: doc.User ? doc.User.userName : null,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                games: games.map(game => ({
                    gameId: game.gameId,
                    title: game.title,
                    coverImage: game.coverImage
                }))
             }
         })
        };
         res.status(200).json(response);
     } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        })
    }
}

async function gamelists_get_user(req, res, next){
    try {
        const GameList = getGameListModel();
        const User = getUserModel();
        const userId = req.params.userId;
        const docs = await GameList.findAll({
            where: {
                userId: userId
            },
            include: [User],
        });
        
       const response = {
        count: docs.length,
        gameLists: docs.map(doc => {
            return {
                listId: doc.listId,
                userId: doc.userId,
                listTitle: doc.listTitle,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            }
        })
       };
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        })
    }
}

async function gamelists_add_gamelist(req, res, next){
    try {
        const GameList = getGameListModel();
        const gameList = {
            listTitle: req.body.listTitle,
            userId: req.body.userId,
        };

        const schema = {
            listTitle: {type:"string", optional: false, max: 200},
            userId: {type:"number", optional: false},
        }
            
        const v = new validator();
        const validationResponse = v.validate(gameList, schema);
            
            if(validationResponse !== true){
                return res.status(400).json({
                    message: "Validation failed",
                    errors: validationResponse
                });
            }

        const result = await GameList.create(gameList);
        console.log(result);
        res.status(201).json({
            message: 'New GameList added successfully!',
            createdGameList: {
                listId: result.listId,
                listTitle: result.listTitle,
                userId: result.userId,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/gamelists/' + result.listId
                }
            }
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        });
    }
}

async function gamelists_get_single(req, res, next){
    const GameList = getGameListModel();
    const id = req.params.listId;
    try {
        const gamelist = await GameList.findByPk(id, {
            include: [
                {   model: User,
                    attributes: ['userName']
                }
            ]
        });

        if (!gamelist) {
            return res.status(404).json({ message: 'Gamelist не найден' });
        }

        const response = {
            listTitle: gamelist.listTitle,
            userName: gamelist.User ? gamelist.User.userName : null,
            createdAt: gamelist.createdAt,
            updatedAt: gamelist.updatedAt,
        };

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

async function gamelists_modify_gamelist(req, res, next){
    try {
        const GameList = getGameListModel();
        const id = req.params.listId;
        
        // Собираем только переданные поля
        const updatedGameList = {};
        if (req.body.listTitle !== undefined) {
            updatedGameList.listTitle = req.body.listTitle;
        }
        if (req.body.userId !== undefined) {
            updatedGameList.userId = req.body.userId;
        }
        
        const schema = {
            listTitle: {type:"string", optional: true, max: 200},
            userId: {type:"number", optional: true},
        }
            
        const v = new validator();
        const validationResponse = v.validate(updatedGameList, schema);
            
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }

        const [affectedCount] = await GameList.update(updatedGameList, {where: { listId: id }});
        if (affectedCount === 0) {
            return res.status(404).json({ message: 'GameList not found or no changes applied' });
        }
        
        res.status(200).json({
            message: 'GameList data updated!',
            request: {
                type: 'PATCH',
                url: 'http://localhost:3000/gamelists/' + id
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        });
    }
}

async function gamelists_delete_gamelist(req, res, next){
    try {
        const GameList = getGameListModel();
        const id = req.params.listId;
        const deletedCount = await GameList.destroy({where:{listId: id}});
        
        if (deletedCount === 0) {
            return res.status(404).json({ message: 'GameList not found' });
        }
        
        res.status(200).json({
            message: 'GameList deleted!',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/gamelists/',
                body: { listTitle: 'String', userId: 'number'}
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        });
    }
}

export {
    gamelists_get_all,
    gamelists_get_user,
    gamelists_add_gamelist,
    gamelists_get_single,
    gamelists_modify_gamelist,
    gamelists_delete_gamelist
}