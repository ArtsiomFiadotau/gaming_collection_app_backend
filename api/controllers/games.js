import validator from 'fastest-validator';
import { getDB } from '../../models/index.js';
const { Game, sequelize } = getDB();

function getGameModel() {
    const db = getDB();
    if (!db || !db.Game) {
      throw new Error('Database not initialized. Game model not available.');
    }
    return db.Game;
  }

async function games_get_all(req, res, next){
    const Game = getGameModel();
    const allGames = Game.findAll({
        attributes: ['gameId', 'title'],
      })
    .then(docs => {
       const response = {
        count: docs.length,
        games: docs.map(doc => {
            return {
                title: doc.title,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/games/' + doc.gameId
                }
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

async function games_add_game(req, res, next){
    const Game = getGameModel();
    // const game = {
    //     gameId: req.body.gameId,
    //     title: req.body.title,
    //     genre: req.body.genre,
    //     developer: req.body.developer,
    //     releaseDate: req.body.releaseDate,
    //     description: req.body.description,
    //     averageRating: req.body.averageRating,
    //     coverImage: req.body.coverImage,
    // };

    // const schema = {
    //     title: {type:"string", optional: false, max: '200'},
    //     genre: {type:"string", optional: false, max: '200'},
    //     developer: {type:"string", optional: false, max: '500'},
    //     releaseDate: {type:"date", optional: false, convert: true},
    //     description: {type:"string", optional: true, max: '2000'},
    //     averageRating: {type:"number", optional: true},
    //     coverImage: {type:"string", optional: true, max: '255'},
    // }
        
    // const v = new validator();
    // const validationResponse = v.validate(game, schema);
        
    //     if(validationResponse !== true){
    //         return res.status(400).json({
    //             message: "Validation failed",
    //             errors: validationResponse
    //         });
    //     }

    const newGame = Game.create(game).then(result => {
        console.log(result);
        res.status(201).json({
            message: 'New game added succesfully!',
            createdGame: {
                title: result.title,
                genre: result.genre,
                developer: result.developer,
                releaseDate: result.releaseDate,
                description: result.description,
                averageRating: result.averageRating,
                coverImage: result.coverImage,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/games/' + result.gameId
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

async function games_get_single(req, res, next){
    const Game = getGameModel();
    const id = req.params.gameId;
    const singleGame = Game.findByPk(id, {
        attributes: {
          exclude: ['updatedAt', 'createdAt'],
        },
      })
        .then(doc => {
            if (doc) {
            res.status(200).json({
                game: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/games'
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

async function games_modify_game(req, res, next){
    const Game = getGameModel();
    const id = req.params.gameId;
    const updatedGame = {
        title: req.body.title,
        genre: req.body.genre,
        developer: req.body.developer,
        releaseDate: req.body.releaseDate,
        description: req.body.description,
        averageRating: req.body.averageRating,
        coverImage: req.body.coverImage,
    };
    
    const updGame = Game.update(updatedGame, {where: { gameId: id }})
    .then(result => {
        res.status(200).json({
            message: 'Game data updated!',
            request: {
                type: 'PATCH',
                url: 'http://localhost:3000/games/' + id
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

async function games_delete_game(req, res, next){
    const Game = getGameModel();
    const id = req.params.gameId;

    const delGame = {
        gameId: req.params.gameId
      }
  
      const schema = {
        gameId: {type:"number", optional: false}
    }
        
    const v = new validator();
    const validationResponse = v.validate(delGame, schema);
        
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }



    const destroyGame = Game.destroy({where:{gameId: id}})
    .then(result => {
        res.status(200).json({
            message: 'Game deleted!',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/games/',
                body: { title: 'String'}
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
    games_get_all,
    games_add_game,
    games_get_single,
    games_modify_game,
    games_delete_game
}