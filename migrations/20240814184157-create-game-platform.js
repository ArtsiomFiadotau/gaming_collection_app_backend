'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('GamePlatforms', {
    gameId: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
      references: {
        model: 'Games',
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
        model: 'Platforms',
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
    fields: ['gameId', 'platformId'],
    type: 'unique',
    name: 'unique_game_platform' // уникальное имя для индекса составного первичного ключа
  });

}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('GamePlatforms');
}