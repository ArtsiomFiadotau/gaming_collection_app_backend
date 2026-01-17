'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GameList extends Model {
    static associate(models) {
      GameList.belongsTo(models.User,
        {
        foreignKey: 'userId'
      }
      );
      GameList.belongsToMany(models.Game, {
        through: 'ListItem',
        foreignKey: 'listId',
        otherKey: 'gameId',
      });
    }
  }
  GameList.init({
    listId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'listId'
    },
    listTitle: {
      type: DataTypes.STRING(200),
      field: 'listTitle'
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'userId'
    }
    }, {
    sequelize,
    modelName: 'GameList',
  })

  return GameList;
};