import validator from 'fastest-validator';
import { getDB } from '../../models/index.js';
const { GameList, User, sequelize } = getDB();
//import { sequelize, GameList, User as _User } from '../../models';

async function gamelists_get_all(req, res, next){
    const allGameLists = GameList.findAll({
            include: [
            {
                model: User,
                attributes: ['userName']
            }]
        },
      )
    .then(docs => {
        const response = {
         count: docs.length,
         gamelists: docs.map(doc => {
             return {
                listTitle: doc.listTitle,
                userName: doc.User ? doc.User.userName : null,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
             }
         })
        };
         res.status(200).json(response);
     })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
}

async function gamelists_get_user(req, res, next){
    const userId = req.params.userId;
    const User = await GameList.findAll(
        {
            where: {
                userId: userId
            },
            include: [User],
        })
    .then(docs => {
       const response = {
        count: docs.length,
        gameLists: docs.map(doc => {
            return {
                listTitle: doc.listTitle,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            }
        })
       };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
}

async function gamelists_add_gamelist(req, res, next){
    const gameList = {
        listTitle: req.body.listTitle,
        userId: req.body.userId,
    };

    const schema = {
        listTitle: {type:"string", optional: false, max: '200'},
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

    const newGameList = GameList.create(gameList).then(result => {
        console.log(result);
        res.status(201).json({
            message: 'New GameList added succesfully!',
            createdGameList: {
                listTitle: result.listTitle,
                userId: result.userId,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/gamelists/' + result.listId
                }
            }
    });
})
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        });
    });
}

async function gamelists_get_single(req, res, next){
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
    const id = req.params.listId;
    const updatedGameList = {
        listTitle: req.body.listTitle,
        userId: req.body.userId,
    };
    
    const schema = {
        listTitle: {type:"string", optional: true, max: '200'},
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

    const updGameList = GameList.update(updatedGameList, {where: { listId: id }})
    .then(result => {
        res.status(200).json({
            message: 'GameList data updated!',
            request: {
                type: 'PATCH',
                url: 'http://localhost:3000/gamelists/' + id
            }
        });

    })
    .catch(err => {
        console.log(err);
        res.status(500),json({
            error: err
        });
    });
}

async function gamelists_delete_gamelist(req, res, next){
    const id = req.params.listId;
    const destroyGameList = GameList.destroy({where:{listId: id}})
    .then(result => {
        res.status(200).json({
            message: 'GameList deleted!',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/gamelists/',
                body: { listTitle: 'String(200)', userId: 'number'}
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

export {
    gamelists_get_all,
    gamelists_get_user,
    gamelists_add_gamelist,
    gamelists_get_single,
    gamelists_modify_gamelist,
    gamelists_delete_gamelist
}