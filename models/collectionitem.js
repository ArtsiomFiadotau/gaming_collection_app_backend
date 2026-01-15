'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CollectionItem extends Model {
    static associate(models) {
        CollectionItem.belongsTo(models.GamePlatform,
            {
            foreignKey: 'gameId'
          }
          );
          CollectionItem.belongsTo(models.GamePlatform,
            {
            foreignKey: 'platformId'
          }
          );
          CollectionItem.belongsTo(models.User,
            {
            foreignKey: 'userId'
          }
          );
        }
    }
  CollectionItem.init({
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    gameId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    platformId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    rating: DataTypes.TINYINT,
    status: DataTypes.STRING(30),
    isOwned: DataTypes.BOOLEAN,
    dateStarted: DataTypes.DATE,
    dateCompleted: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'CollectionItem',
  });
  return CollectionItem;
};