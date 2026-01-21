import validator from 'fastest-validator';
import { getDB } from '../../models/index.js';
const { ListItem, Game, GameList, User, sequelize } = getDB();

function getListItemModel() {
  const db = getDB();
  if (!db || !db.ListItem) {
    throw new Error('Database not initialized. ListItem model not available.');
  }
  return db.Game;
}

async function listitems_get_singlelist(req, res, next) {
  const ListItem = getListItemModel();  
  const listId = req.params.listId;
  
    try {
      // Получаем все ListItems по listId, с включением связей
      const listItems = await ListItem.findAll({
        where: { listId },
        include: [
          {
            model: Game,
            attributes: ['title']
          },
          {
            model: GameList,
            attributes: ['listTitle', 'userId'],
            include: [
              {
                model: User,
                attributes: ['userName']
              }
            ]
          }
        ]
      });
  
      if (!listItems || listItems.length === 0) {
        return res.status(404).json({ message: 'No items found for this list.' });
      }
  
      // Получаем название списка и имя пользователя из первой записи
      const firstItem = listItems[0];
      const listTitle = firstItem.GameList.listTitle;
      const userName = firstItem.GameList.User.userName;
  
      // Формируем список игр с их названиями
      const games = listItems.map(item => ({
        gameId: item.gameId,
        title: item.Game.title
      }));
  
      const response = {
        listTitle,
        userName,
        games
      };
  
      res.status(200).json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

async function listitems_add_listitem(req, res, next) {
  const ListItem = getListItemModel();   
  const listItem = {
        gameId: req.body.gameId,
        listId: req.body.listId,
        };

        const schema = {
            gameId: {type:"number", optional: false},
            listId: {type:"number", optional: false},
        }
            
        const v = new validator();
        const validationResponse = v.validate(listItem, schema);
            
            if(validationResponse !== true){
                return res.status(400).json({
                    message: "Validation failed",
                    errors: validationResponse
                });
            }

        if (listItem.gameId && listItem.listId) {
    const newListItem = await ListItem.create(listItem).then(result => {
        console.log(result);
        res.status(201).json({
            message: 'New ListItem added succesfully!',
            createdlistItem: {
                gameId: result.gameId,
                listId: result.listId,
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/gamelists/' + result.gameId + '/' + result.listId
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

    async function listitems_delete_listitem(req, res, next){
      const ListItem = getListItemModel(); 
      const delListItem = {
        listId: req.body.listId,
        gameId: req.body.gameId}
  
        const schema = {
          listId: {type:"number", optional: false},
          gameId: {type:"number", optional: false}}
          
      const v = new validator();
      const validationResponse = v.validate(delListItem, schema);
          
          if(validationResponse !== true){
              return res.status(400).json({
                  message: "Validation failed",
                  errors: validationResponse
              });
          }

      const destroyListItem = ListItem.destroy({where:{listId: delListItem.listId, gameId: delListItem.gameId}})
      .then(result => {
          res.status(200).json({
              message: 'List Item deleted!',
              request: {
                  type: 'POST',
                  url: 'http://localhost:3000/listitems/',
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
    listitems_get_singlelist,
    listitems_add_listitem,
    listitems_delete_listitem
   }