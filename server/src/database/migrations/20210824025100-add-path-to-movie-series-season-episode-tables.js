'use strict';
const { Sequelize } = require('sequelize')
module.exports = {
  up: async ({context: queryInterface}) => {
    await queryInterface.addColumn(
      'Series',
      'path',
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    )
    await queryInterface.addColumn(
      'Movie',
      'path',
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    )
    await queryInterface.addColumn(
      'MovieFile',
      'path',
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    )
    await queryInterface.addColumn(
      'Season',
      'path',
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    )
    await queryInterface.addColumn(
      'Episode',
      'path',
      {
        type: Sequelize.STRING,
        allowNull: false,
      },
    )
  },

  down: async ({context: queryInterface}) => {
    await queryInterface.removeColumn('Series', 'path')
    await queryInterface.removeColumn('Movie', 'path')
    await queryInterface.removeColumn('MovieFile', 'path')
    await queryInterface.removeColumn('Season', 'path')
    await queryInterface.removeColumn('Episode', 'path')
    
  }
};
