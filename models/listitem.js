'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class ListItem extends Model {
    static associate(models) {
      ListItem.belongsTo(models.GameList, { foreignKey: 'listId', targetKey: 'listId', onDelete: 'CASCADE' });
      ListItem.belongsTo(models.Game, { foreignKey: 'gameId', targetKey: 'gameId', onDelete: 'CASCADE' });
    }
  }
  ListItem.init({
    listId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'GameLists',
        key: 'listId'
      }
    },
    gameId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'Games',
        key: 'gameId'
      }
    }
  }, {
    sequelize,
    modelName: 'ListItem',
    tableName: 'ListItems',
    timestamps: true,
  });
  return ListItem;
};