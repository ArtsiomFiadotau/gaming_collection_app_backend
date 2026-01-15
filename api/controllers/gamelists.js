const validator = require('fastest-validator');
const models = require('../../models');
models.sequelize.sync();

async function gamelists_get_all(req, res, next){
    const allGameLists = models.GameList.findAll({
        attributes: {
          include: [models.User],
        },
      })
    .then(result => {
        res.status(200).json(result);
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
    const User = await models.GameList.findAll(
        {
            where: {
                userId: userId
            },
            include: [models.User],
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

    const newGameList = models.GameList.create(gameList).then(result => {
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
    const singleGameList = models.GameList.findByPk(id, {
        attributes: {
          exclude: ['updatedAt', 'createdAt'],
        },
      })
        .then(doc => {
            console.log("From database", doc);
            if (doc) {
            res.status(200).json({
                gameList: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/gamelists'
                }
            });
        } else {
            res.status(404).json({message: 'No valid data for id'});
        }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
    });
}

async function gamelists_modify_gamelist(req, res, next){
    const id = req.params.listId;
    const updatedGameList = {
        listTitle: req.body.listTitle,
        userId: req.body.userId,
    };
    
    const schema = {
        listTitle: {type:"string", optional: false, max: '200'},
        userId: {type:"number", optional: false},
    }
        
    const v = new validator();
    const validationResponse = v.validate(updatedGameList, schema);
        
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }

    const updGameList = models.GameList.update(updatedGameList, {where: { listId: id }})
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
    const destroyGameList = models.GameList.destroy({where:{listId: id}})
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

module.exports = {
    gamelists_get_all,
    gamelists_get_user,
    gamelists_add_gamelist,
    gamelists_get_single,
    gamelists_modify_gamelist,
    gamelists_delete_gamelist
}