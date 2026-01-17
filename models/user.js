'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(sequelize.define('Review'));
      User.hasMany(sequelize.define('Comment'));
      User.hasMany(sequelize.define('GameList')); 
    }
  }
  User.init({
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    userName: DataTypes.STRING(30),
    avatarUrl: DataTypes.STRING,
    gamesNumber: DataTypes.INTEGER,
    gamesCompleted: DataTypes.INTEGER,
    ratingAverage: DataTypes.TINYINT,
    isModerator: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};