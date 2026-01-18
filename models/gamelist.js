'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class GameList extends Model {
    static associate(models) {
      GameList.hasMany(models.ListItem, { foreignKey: 'listId'});
      GameList.belongsTo(models.User, { foreignKey: 'userId' });
      GameList.belongsToMany(models.Game, {
        through: models.ListItem, // ссылка на модель, не строку
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
    tableName: 'GameLists',
    timestamps: true
  });

  return GameList;
};