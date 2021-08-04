'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Library',
      'crawling',
      {
        type: Sequelize.BOOLEAN,
      },
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Library', 'crawling')
  },
};