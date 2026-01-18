'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Platform extends Model {
    static associate(models) {
      Platform.belongsToMany(models.Game, {
        through: 'GamePlatforms',
        foreignKey: 'platformId',
        otherKey: 'gameId',
      });
    }
 }
  Platform.init({
    platformId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    platformName: DataTypes.STRING(50)
  }, {
    sequelize,
    modelName: 'Platform',
  });
  
  return Platform;
};