'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User,
        {
        foreignKey: 'userId'
      }
      );
      Review.belongsTo(models.Game,
        {
        foreignKey: 'gameId'
      }
      );
      Review.hasMany(sequelize.define('Comment'));
    }
  }
  Review.init({
    reviewId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reviewTitle: DataTypes.STRING(50),
    reviewText: DataTypes.STRING(2000),
    userId: DataTypes.INTEGER,
    gameId: DataTypes.INTEGER
    }, {
    sequelize,
    modelName: 'Review',
  });
 
  return Review;
};