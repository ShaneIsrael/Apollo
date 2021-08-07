'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Season',
      'tmdb_poster_path',
      {
        type: Sequelize.STRING
      },
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Season', 'tmdb_poster_path')
  },
};