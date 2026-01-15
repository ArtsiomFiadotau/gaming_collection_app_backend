'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ListItem extends Model {
    static associate(models) {
      ListItem.belongsTo(models.GameList, { foreignKey: 'listId' });    //добавил по совету
      ListItem.belongsTo(models.Game, { foreignKey: 'gameId' });        //добавил по совету
    }
  }
  ListItem.init({
    listId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    gameId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  }, {
    sequelize,
    modelName: 'ListItem',
  });
  return ListItem;
};