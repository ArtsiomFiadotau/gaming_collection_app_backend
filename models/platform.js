'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Platform extends Model {
    static associate(models) {
      Platform.belongsToMany(models.Game, {
        through: 'GamePlatform',
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