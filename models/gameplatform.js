'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GamePlatform extends Model {
    static associate(models) {
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