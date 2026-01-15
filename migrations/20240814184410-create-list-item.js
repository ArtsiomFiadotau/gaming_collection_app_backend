'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ListItems', {
      listId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'GameLists',
          key: 'listId'
        },
        onUpdate: 'NO ACTION',
        onDelete: 'CASCADE'
      },
      gameId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Games',
          key: 'gameId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.addConstraint('ListItems', {
      fields: ['listId', 'gameId'],  // поля для составного первичного ключа
      type: 'unique',
      name: 'unique_list_game' // уникальное имя для индекса составного первичного ключа
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ListItems');
  }
};
