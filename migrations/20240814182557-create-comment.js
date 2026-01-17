'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Comments', {
    commentId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'userId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    reviewId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'Reviews',
        key: 'reviewId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    commentText: {
      allowNull: false,
      type: Sequelize.STRING(1000)
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
  await queryInterface.dropTable('Comments');
}