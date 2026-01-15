const validator = require('fastest-validator');
const models = require('../../models');
models.sequelize.sync();

async function collectionitems_get_collectionitem(req, res, next) {
  const id1 = req.params.userId;
  const id2 = req.params.gameId;

  const collectionItem = await models.CollectionItems.findOne(
      {
          where: {
            userId: id1,
            gameId: id2,
          },
          include:[models.Game, models.Platform]
      })
      .then(result => {
          console.log("From database", result);
          if (result) {
          res.status(200).json(result);
      } else {
          res.status(404).json({message: 'No such CollectionItem!'});
      }
      })
      .catch(err => {
          console.log(err);
          res.status(500).json({error: err});
  });
}

async function collectionitems_get_usercollection(req, res, next){
  const userId = req.params.userId;
  const userCollection = await models.CollectionItem.findAll({
    where: {
      userId: userId
    },
    include: [{
       model: models.Game,
       attributes: ['title']
    },
    {
      model: models.Platform,
      attributes: ['platformName']
   }],
}  , 
    )
  .then(docs => {
     const response = {
          games: docs.map(doc => {
          return {
            gameId: doc.gameId,
            title: doc.Game ? doc.Game.title : null,
            platformName: doc.Platform ? doc.Platform.title : null,
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

  const newCollectionItem = models.CollectionItem.create(collectionItem).then(result => {
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
  const validationResponse = v.validate(updatedCollectionItem, schema);
      
      if(validationResponse !== true){
          return res.status(400).json({
              message: "Validation failed",
              errors: validationResponse
          });
      }

  const updCollectionItem = await models.CollectionItem.update(updatedCollectionItem, 
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
        // rating: {type:"number", optional: true},
        // status: {type:"string", optional: false},
        // isOwned: {type:"boolean", optional: false},
        // dateStarted: {type:"date", optional: true, convert: true},
        // dateCompleted: {type:"date", optional: true, convert: true},
    }
        
    const v = new validator();
    const validationResponse = v.validate(delCollectionItem, schema);
        
        if(validationResponse !== true){
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResponse
            });
        }

      const destroyCollectionItem = models.CollectionItem.destroy({where:{userId: delCollectionItem.userId, gameId: delCollectionItem.gameId, platformId: delCollectionItem.platformId}})
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

module.exports = {
  collectionitems_get_collectionitem,
  collectionitems_get_usercollection,
  collectionitems_add_collectionitem,
  collectionitems_modify_collectionitem,
  collectionitems_delete_collectionitem
   }