import validator from 'fastest-validator';
import { sequelize, CollectionItem, GamePlatform, Game, Platform, User } from '../../models';
sequelize.sync();

async function collectionitems_get_collectionitem(req, res, next){
    const userId = req.params.userId;
    const gameId = req.params.gameId;
    const platformId = req.params.platformId;
    
    try {
        const collectionItem = await CollectionItem.findOne({
            where: {
                userId,
                gameId,
                platformId
            },
            include: [
                {
                    model: GamePlatform,
                    attributes: ['gameId', 'platformId'],
                    include: [
                        {
                          model: Game,
                          attributes: ['title']
                        },
                        {
                            model: Platform,
                            attributes: ['platformName']
                          }
                      ]
                }
            ]
        });

        if (!collectionItem) {
            return res.status(404).json({ message: 'Collection Item не найден' });
        }

        const response = {
            title: collectionItem.GamePlatform ? collectionItem.GamePlatform.Game.title : null,
            platformName: collectionItem.GamePlatform ? collectionItem.GamePlatform.Platform.platformName : null,
            rating: collectionItem.rating ? collectionItem.rating : "not specified",
            status: collectionItem.status ? collectionItem.status : "not specified",
            isOwned: collectionItem.isOwned ? collectionItem.isOwned : false,
        };

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
}

async function collectionitems_get_usercollection(req, res, next) {
    const userId = req.params.userId;
  
    try {
      // Получаем все CollectionItems по userId, с включением связей
      const collectionItems = await CollectionItem.findAll({
        where: {
            userId
        },
        include: [
            {
                model: GamePlatform,
                attributes: ['gameId', 'platformId'],
                include: [
                    {
                      model: Game,
                      attributes: ['title']
                    },
                    {
                        model: Platform,
                        attributes: ['platformName']
                      }
                  ]
            },
                {
                  model: User,
                  attributes: ['userName']
                }
        ]
    });
  
        if (!collectionItems || collectionItems.length === 0) {
        return res.status(404).json({ message: 'No collection items found for this user.' });
      }
  
      // Получаем имя пользователя из первой записи
      const firstItem = collectionItems[0];
      const userName = firstItem.User.userName;
  
      // Формируем список игр с их названиями
      const games = collectionItems.map(item => ({
        gameId: item.gameId,
        title: item.GamePlatform.Game.title
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
  const collectionItem = {
      userId: req.body.userId,
      gameId: req.body.gameId,
      platformId: req.body.platformId,
      rating: req.body.rating,
      status: req.body.status,
      isOwned: req.body.isOwned,
      dateStarted: req.body.dateStarted,
      dateCompleted: req.body.dateCompleted,
  };

  const schema = {
      userId: {type:"number", optional: false},
      gameId: {type:"number", optional: false},
      platformId: {type:"string", optional: false},
      rating: {type:"number", optional: true},
      status: {type:"string", optional: false},
      isOwned: {type:"boolean", optional: false},
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
      console.log(result);
      res.status(201).json({
          message: 'New collection item added succesfully!',
          createdCollectionItem: {
            userId: result.userId,
            gameId: result.gameId,
            platformId: result.platformId,
            rating: result.rating,
            status: result.status,
            isOwned: result.isOwned,
            dateStarted: result.dateStarted,
            dateCompleted: result.dateCompleted,
              request: {
                  type: 'POST',
                  url: 'http://localhost:3000/collectionItems/' + result.userId + '/' + result.gameId + '/' + result.platformId
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
  const updatedCollectionItem = {
    userId: req.body.userId,
    gameId: req.body.gameId,
    platformId: req.body.platformId,
    rating: req.body.rating,
    status: req.body.status,
    isOwned: req.body.isOwned,
    dateStarted: req.body.dateStarted,
    dateCompleted: req.body.dateCompleted,
};

const schema = {
    userId: {type:"number", optional: true},
    gameId: {type:"number", optional: true},
    platformId: {type:"string", optional: true},
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
      platformId: updatedCollectionItem.platformId
    }})
  .then(result => {
      res.status(200).json({
          message: 'CollectionItem data updated!',
          request: {
              type: 'PATCH',
              url: 'http://localhost:3000/collectionItems/'  + result.userId + '/' + result.gameId + '/' + result.platformId
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
      const delCollectionItem = {
        userId: req.body.userId,
        gameId: req.body.gameId,
        platformId: req.body.platformId,
      }
  
      const schema = {
        userId: {type:"number", optional: false},
        gameId: {type:"number", optional: false},
        platformId: {type:"string", optional: false},
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
        gameId: delCollectionItem.gameId, 
        platformId: delCollectionItem.platformId}})
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

export default {
  collectionitems_get_collectionitem,
  collectionitems_get_usercollection,
  collectionitems_add_collectionitem,
  collectionitems_modify_collectionitem,
  collectionitems_delete_collectionitem
}