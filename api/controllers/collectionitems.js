import validator from 'fastest-validator';
import { getDB } from '../../models/index.js';
const { CollectionItem, Game, User, sequelize } = db;

function getCollectionItemModel() {
    const db = getDB();
    if (!db || !db.CollectionItem) {
      throw new Error('Database not initialized. CollectionItem model not available.');
    }
    return db.CollectionItem;
  }

async function collectionitems_get_collectionitem(req, res, next){
  const CollectionItem = getCollectionItemModel();  
  const userId = req.params.userId;
    const gameId = req.params.gameId;
    
    try {
      const includeGame = Game ? { model: Game } : 'Game';
        const collectionItem = await CollectionItem.findOne({
            where: {
                userId,
                gameId
            },
            include: [ includeGame ]
        });

        if (!collectionItem) {
            return res.status(404).json({ message: 'Collection Item не найден' });
        }

        const response = {
            userId: collectionItem.userId,  
            gameId: collectionItem.gameId,  
            title: collectionItem.Game ? collectionItem.Game.title : null,
            coverImage: collectionItem.Game ? collectionItem.Game.coverImage : null,
            rating: collectionItem.rating ? collectionItem.rating : "not specified",
            status: collectionItem.status ? collectionItem.status : "not specified",
            isOwned: collectionItem.isOwned ? collectionItem.isOwned : false,
            dateStarted: collectionItem.dateStarted || null,  
            dateCompleted: collectionItem.dateCompleted || null,  
        };

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

async function collectionitems_get_usercollection(req, res, next) {
  const CollectionItem = getCollectionItemModel();  
  const userId = req.params.userId;
  
    try {
      // Получаем все CollectionItems по userId, с включением связей
      const includeGame = Game ? { model: Game } : 'Game';  
      const includeUser = User ? { model: User } : 'User';  
      const collectionItems = await CollectionItem.findAll({
        where: {
            userId
        },
        include: [ includeGame, includeUser ], 
    });
  
        if (!collectionItems || collectionItems.length === 0) {
        return res.status(404).json({ message: 'No collection items found for this user.' });
      }
  
      // Получаем имя пользователя из первой записи
      const firstItem = collectionItems[0];
      const userName = firstItem.User ? firstItem.User.userName : null;  
  
      // Формируем список игр с их названиями
      const games = collectionItems.map(item => ({
        userId: item.userId, 
        gameId: item.gameId,
        title: item.Game ? item.Game.title : null,  
        coverImage: item.Game ? item.Game.coverImage : null 
      }));
  
      const response = {
        userName,
        games
      };
  
      res.status(200).json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

async function collectionitems_add_collectionitem(req, res, next){
  const CollectionItem = getCollectionItemModel();
  const collectionItem = {
      userId: req.body.userId,
      gameId: req.body.gameId,
      rating: req.body.rating,
      status: req.body.status,
      isOwned: req.body.isOwned,
      dateStarted: req.body.dateStarted,
      dateCompleted: req.body.dateCompleted,
  };

  const schema = {
    userId: {type:"number", optional: true},
    gameId: {type:"number", optional: true},
    rating: {type:"number", optional: true},
    status: {type:"string", optional: true},
    isOwned: {type:"boolean", optional: true},
    dateStarted: {type:"date", optional: true},
    dateCompleted: {type:"date", optional: true},
  }
      
  const v = new validator();
  const validationResponse = v.validate(collectionItem, schema);
      
      if(validationResponse !== true){
          return res.status(400).json({
              message: "Validation failed",
              errors: validationResponse
          });
      }

  const newCollectionItem = CollectionItem.create(collectionItem).then(result => {
      res.status(201).json({
          message: 'New collection item added succesfully!',
          createdCollectionItem: {
            userId: result.userId,
            gameId: result.gameId,
            rating: result.rating,
            status: result.status,
            isOwned: result.isOwned,
            dateStarted: result.dateStarted,
            dateCompleted: result.dateCompleted,
              request: {
                  type: 'POST',
                  url: 'http://localhost:3000/collectionItems/' + result.userId + '/' + result.gameId 
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

async function collectionitems_modify_collectionitem(req, res, next) {
  const CollectionItem = getCollectionItemModel();
  const updatedCollectionItem = {
    userId: req.body.userId,
    gameId: req.body.gameId,
    rating: req.body.rating,
    status: req.body.status,
    isOwned: req.body.isOwned,
    dateStarted: req.body.dateStarted,
    dateCompleted: req.body.dateCompleted,
};

const schema = {
    userId: {type:"number", optional: true},
    gameId: {type:"number", optional: true},
    rating: {type:"number", optional: true},
    status: {type:"string", optional: true},
    isOwned: {type:"boolean", optional: true},
    dateStarted: {type:"date", optional: true},
    dateCompleted: {type:"date", optional: true},
}
      
  const v = new validator();
  const validationResponse = v.validate(updatedCollectionItem, schema);
      
      if(validationResponse !== true){
          return res.status(400).json({
              message: "Validation failed",
              errors: validationResponse
          });
      }

  const updCollectionItem = await CollectionItem.update(updatedCollectionItem, 
    {where: {
      userId: updatedCollectionItem.userId,
      gameId: updatedCollectionItem.gameId,
    }})
  .then(result => {
      res.status(200).json({
          message: 'CollectionItem data updated!',
          request: {
              type: 'PATCH',
              url: 'http://localhost:3000/collectionItems/'  + result.userId + '/' + result.gameId
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


    async function collectionitems_delete_collectionitem(req, res, next){
      const CollectionItem = getCollectionItemModel();
      const delCollectionItem = {
        userId: req.body.userId,
        gameId: req.body.gameId,
      }
  
      const schema = {
        userId: {type:"number", optional: false},
        gameId: {type:"number", optional: false}
    }
        
    const v = new validator();
    const validationResponse = v.validate(delCollectionItem, schema);
        
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }

      const destroyCollectionItem = CollectionItem.destroy({where:
        {userId: delCollectionItem.userId, 
        gameId: delCollectionItem.gameId}})
      .then(result => {
          res.status(200).json({
              message: 'Collection Item deleted!',
              request: {
                  type: 'POST',
                  url: 'http://localhost:3000/collectionitems/',
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
  collectionitems_get_collectionitem,
  collectionitems_get_usercollection,
  collectionitems_add_collectionitem,
  collectionitems_modify_collectionitem,
  collectionitems_delete_collectionitem
};