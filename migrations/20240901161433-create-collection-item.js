'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CollectionItems', {
      userId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Ссылка на таблицу Users
          key: 'userId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      gameId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      platformId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      rating: {
        allowNull: false,
        type: Sequelize.TINYINT,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      isOwned: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      dateStarted: {
        allowNull: true,
        type: Sequelize.DATE
      },
      dateCompleted: {
        allowNull: true,
        type: Sequelize.DATE
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
    await queryInterface.addConstraint('CollectionItems', {
      fields: ['gameId', 'platformId'], // оба поля для составного внешнего ключа из GamePlatforms
      type: 'foreign key',
      references: {
        table: 'GamePlatforms',
        fields: ['gameId', 'platformId'], // ссылка на оба поля внешней таблицы 
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint('CollectionItems', {
      fields: ['gameId', 'platformId', 'userId'],  // поля для составного первичного ключа
      type: 'unique',
      name: 'unique_game_platform_user' // уникальное имя для индекса составного первичного ключа
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CollectionItems');
  }
};