'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Series',
      'uuid',
      {
        type: Sequelize.STRING
      },
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Series', 'uuid')
  },
};