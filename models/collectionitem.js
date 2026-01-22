import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class CollectionItem extends Model {
    static associate(models) {
      CollectionItem.belongsTo(models.Game, {
        foreignKey: 'gameId'
      });
      CollectionItem.belongsTo(models.User, {
        foreignKey: 'userId'
      });
    }
  }

  CollectionItem.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      gameId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      rating: DataTypes.INTEGER,
      status: DataTypes.STRING(100),
      isOwned: DataTypes.BOOLEAN,
      dateStarted: DataTypes.STRING,
      dateCompleted: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'CollectionItem',
    }
  );

  return CollectionItem;
};