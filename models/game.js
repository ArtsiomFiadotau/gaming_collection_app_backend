'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Game extends Model {
    static associate(models) {
      Game.belongsToMany(models.Platform, {
        through: 'GamePlatform',
        foreignKey: 'gameId',
        otherKey: 'platformId',
      });
      Game.belongsToMany(models.GameList, {
        through: 'ListItem',
        foreignKey: 'gameId',
        otherKey: 'listId',
      });
      Game.hasMany(sequelize.define('Review'));
    }
  }
  Game.init({
    gameId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: DataTypes.STRING(50),
    genre: DataTypes.STRING(50),
    developer: DataTypes.STRING(50),
    releaseDate: DataTypes.DATE,
    description: DataTypes.STRING(200),
    averageRating: DataTypes.TINYINT,
    coverImage: DataTypes.STRING(30)
  }, {
    sequelize,
    modelName: 'Game',
  });
  return Game;
};