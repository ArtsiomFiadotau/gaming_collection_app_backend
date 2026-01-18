'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Reviews', {
    reviewId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'User',
        key: 'userId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    gameId: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'Game',
        key: 'gameId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    reviewTitle: {
      allowNull: true,
      type: Sequelize.STRING(50)
    },
    reviewText: {
      allowNull: false,
      type: Sequelize.STRING(2000)
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Reviews');
}