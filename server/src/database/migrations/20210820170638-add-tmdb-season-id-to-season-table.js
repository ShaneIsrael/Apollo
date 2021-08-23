const { Sequelize } = require('sequelize')
module.exports = {
  up: ({ context: queryInterface }) => {
    return queryInterface.addColumn(
      'Season',
      'tmdbId',
      {
        type: Sequelize.INTEGER
      },
    )
  },

  down: ({ context: queryInterface }) => {
    return queryInterface.removeColumn('Season', 'tmdbId')
  },
};