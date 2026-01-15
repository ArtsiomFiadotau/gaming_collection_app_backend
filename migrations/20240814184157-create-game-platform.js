'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GamePlatforms', {
      gameId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Games', // Ссылка на таблицу Game
          key: 'gameId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      platformId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Platforms', // Ссылка на таблицу Platform
          key: 'platformId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.addConstraint('GamePlatforms', {
      fields: ['gameId', 'platformId'],  // поля для составного первичного ключа
      type: 'unique',
      name: 'unique_game_platform' // уникальное имя для индекса составного первичного ключа
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GamePlatforms');
  }
};