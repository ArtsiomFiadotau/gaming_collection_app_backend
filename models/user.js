'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
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
    gamesNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    gamesCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ratingAverage: {
      type: DataTypes.TINYINT,
      defaultValue: 0
    },
    isModerator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};