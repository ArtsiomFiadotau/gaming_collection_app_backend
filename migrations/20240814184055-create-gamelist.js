'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GameLists', {
      listId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Ссылка на таблицу User
          key: 'userId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      listTitle: {
        allowNull: true,
        type: Sequelize.STRING(200)
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
 
  await queryInterface.addConstraint('GameLists', {
    fields: ['userId'],
    type: 'foreign key',
    name: 'fk_gameLists_users',
    references: {
      table: 'Users',
      field: 'userId'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  });
},
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GameLists');
  }
};