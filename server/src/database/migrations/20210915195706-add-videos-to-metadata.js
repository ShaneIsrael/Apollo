'use strict';
const { Sequelize } = require('sequelize')
module.exports = {
  up: async ({context: queryInterface}) => {
    await queryInterface.addColumn(
      'Metadata',
      'videos',
      {
        type: Sequelize.JSON,
      },
    )
  },

  down: async ({context: queryInterface}) => {
    await queryInterface.removeColumn('Metadata', 'videos')
  }
}
