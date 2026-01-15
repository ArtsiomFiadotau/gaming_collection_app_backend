const validator = require('fastest-validator');
const models = require('../../models');
models.sequelize.sync();

async function listitems_get_singlelist(req, res, next){
    const listId = req.params.listId;
    const SingleList = await models.ListItem.findAll(
        {
            where: {
                listId: listId
            },
            include: [models.User, models.Game],
        }   
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

//   async function listitems_get_singlelist(req, res, next) {
//     const listId = req.params.listId;

//     try {
//         // Шаг 1: Получение данных о списке по listId
//         const list = await models.List.findOne({
//             where: { listId: listId },
//             attributes: ['listTitle']
//         });

//         if (!list) {
//             return res.status(404).json({ message: 'List not found' });
//         }

//         // Шаг 2: Получение всех элементов списка и связанных игр
//         const listItems = await models.ListItem.findAll({
//             where: { listId: listId },
//             include: [{
//                 model: models.Game,
//                 attributes: ['title']
//             }]
//         });

//         // Шаг 3: Формируем ответ
//         const response = {
//             listTitle: list.listTitle,
//             games: listItems.map(item => {
//                 return {
//                     gameId: item.gameId,
//                     title: item.Game ? item.Game.title : null
//                 };
//             })
//         };

//         res.status(200).json(response);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: err });
//     }
// }

async function listitems_add_listitem(req, res, next) {
    const listitem = {
      listId: req.body.listId,
      gameId: req.body.gameId
    }

    const schema = {
      listId: {type:"number", optional: false},
      gameId: {type:"number", optional: false}}
      
  const v = new validator();
  const validationResponse = v.validate(listitem, schema);
      
      if(validationResponse !== true){
          return res.status(400).json({
              message: "Validation failed",
              errors: validationResponse
          });
      }

    try {
        const listItem = await models.ListItem.create(listitem);
        return res.status(201).json(listItem);
      } catch (error) {
        return res.status(500).json({ message: 'Error adding listitem', error });
      }
    };

    async function listitems_delete_listitem(req, res, next){
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

      const destroyListItem = models.ListItem.destroy({where:{listId: delListItem.listId, gameId: delListItem.gameId}})
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

module.exports = {
    listitems_get_singlelist,
   // subjectteachers_get_singlesubject,
    listitems_add_listitem,
    listitems_delete_listitem
   }