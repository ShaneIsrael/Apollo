'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Movie',
      'uuid',
      {
        type: Sequelize.STRING,
      },
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Movie', 'uuid')
  },
};