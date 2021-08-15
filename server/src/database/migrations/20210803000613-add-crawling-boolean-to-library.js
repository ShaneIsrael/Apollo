const { Sequelize } = require('sequelize')
module.exports = {
  up: ({ context: queryInterface }) => {
    return queryInterface.addColumn(
      'Library',
      'crawling',
      {
        type: Sequelize.BOOLEAN,
      },
    )
  },

  down: ({ context: queryInterface }) => {
    return queryInterface.removeColumn('Library', 'crawling')
  },
};