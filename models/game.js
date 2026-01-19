'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Game extends Model {
    static associate(models) {
      Game.belongsToMany(models.Platform, {
        through: 'GamePlatforms',
        foreignKey: 'gameId',
        otherKey: 'platformId',
      });
      Game.belongsToMany(models.GameList, {
        through: 'ListItems',
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
    title: DataTypes.STRING(200),
    genre: DataTypes.STRING(200),
    developer: DataTypes.STRING(200),
    releaseDate: DataTypes.STRING,
    description: DataTypes.STRING,
    averageRating: DataTypes.INTEGER,
    coverImage: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Game',
  });
  return Game;
};