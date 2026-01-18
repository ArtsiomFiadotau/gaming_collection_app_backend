'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('ListItems', {
    listId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: 'GameList',
        key: 'listId'
      },
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE'
    },
    gameId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Game',
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
    fields: ['listId', 'gameId'],
    type: 'unique',
    name: 'unique_list_item' // уникальное имя для индекса составного первичного ключа
  });
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('ListItems');
}
