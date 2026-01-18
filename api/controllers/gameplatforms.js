import validator from 'fastest-validator';
import { getDB } from '../../models/index.js';
const { GamePlatform, sequelize } = getDB();
//import { sequelize, GamePlatform } from '../../models';

async function gameplatforms_get_singlegame(req, res, next){
    const gameId = req.params.gameId;
    const SingleGame = await GamePlatform.findAll({where: {gameId: gameId}}, 
      )
    .then(docs => {
       const response = {
            subjects: docs.map(doc => {
            return {
                platformId: doc.platformId, 
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

  async function gameplatforms_get_singleplatform(req, res, next){
    const platformId = req.params.platformId;
    const SinglePlatform = await GamePlatform.findAll({where: {platformId: platformId}}, 
      )
    .then(docs => {
       const response = {
            games: docs.map(doc => {
            return {
                gameId: doc.gameId, 
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

async function gameplatforms_add_gameplatform(req, res, next) {
    const gamePlatform = {
        gameId: req.body.gameId,
        platformId: req.body.platformId,
        };

        const schema = {
            gameId: {type:"string", optional: false},
            platformId: {type:"string", optional: false},
        }
            
        const v = new validator();
        const validationResponse = v.validate(gamePlatform, schema);
            
            if(validationResponse !== true){
                return res.status(400).json({
                    message: "Validation failed",
                    errors: validationResponse
                });
            }

        if (gamePlatform.gameId && gamePlatform.platformId) {
    const newGamePlatform = await GamePlatform.create(gamePlatform).then(result => {
        console.log(result);
        res.status(201).json({
            message: 'New GamePlatform added succesfully!',
            createdgamePatform: {
                gameId: result.gameId,
                platformId: result.platformId,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/gameplatforms/' + result.gameId + '/' + result.platformId
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
}

async function gameplatforms_modify_gameplatform(req, res, next) {
    const id1 = req.params.gameId;
    const id2 = req.params.platformId;
    const updatedGamePlatform = {
        gameId: req.body.gameId,
        platformId: req.body.platformId,
    };
    
    const schema = {
        gameId: {type:"number", optional: true},
        platformId: {type:"string", optional: true},
    }
        
    const v = new validator();
    const validationResponse = v.validate(updatedGamePlatform, schema);
        
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }

    const updGamePlatform = await GamePlatform.update(updatedGamePlatform, {where: {gameId: id1, platformId: id2}})
    .then(result => {
        res.status(200).json({
            message: 'GamePlatform data updated!',
            request: {
                type: 'PATCH',
                url: 'http://localhost:3000/gameplatforms/' + id1 + '/' + id2
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

async function gameplatforms_delete_gameplatform(req, res, next) {
    const id1 = req.params.gameId;
    const id2 = req.params.platformId;
    const destrGamePlatform = await GamePlatform.destroy({where: {gameId: id1, platformId: id2}})
    .then(result => {
        res.status(200).json({
            message: 'GamePlatform deleted!',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/gameplatforms/',
                body: { gamiId: 'tinyint', platformId: 'char'}
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
    gameplatforms_get_singleplatform,
    gameplatforms_get_singlegame,
    gameplatforms_add_gameplatform,
    gameplatforms_modify_gameplatform,
    gameplatforms_delete_gameplatform
}