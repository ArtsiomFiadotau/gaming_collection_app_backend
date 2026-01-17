'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class GamePlatform extends Model {
    static associate(models) {
      GamePlatform.belongsTo(models.Game, { foreignKey: 'gameId' });        //добавил по совету аналогично ListItem
      GamePlatform.belongsTo(models.Platform, { foreignKey: 'platformId' });    //добавил по совету аналогично ListItem
    }
  }
  GamePlatform.init({
    gameId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    platformId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  }, {
    sequelize,
    modelName: 'GamePlatform',
  });
  return GamePlatform;
};