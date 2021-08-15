const { Sequelize } = require('sequelize')
module.exports = {
  up: ({ context: queryInterface }) => {
    return queryInterface.addColumn(
      'Season',
      'tmdb_poster_path',
      {
        type: Sequelize.STRING
      },
    )
  },

  down: ({ context: queryInterface }) => {
    return queryInterface.removeColumn('Season', 'tmdb_poster_path')
  },
};