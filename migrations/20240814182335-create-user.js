'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Users', {
    userId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    userName: {
      type: Sequelize.STRING
    },
    avatarUrl: {
      type: Sequelize.STRING
    },
    gamesNumber: {
      type: Sequelize.INTEGER
    },
    gamesCompleted: {
      type: Sequelize.INTEGER
    },
    ratingAverage: {
      type: Sequelize.TINYINT
    },
    isModerator: {
      type: Sequelize.BOOLEAN
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
  await queryInterface.dropTable('Users');
}