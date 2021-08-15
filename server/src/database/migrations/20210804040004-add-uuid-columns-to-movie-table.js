const { Sequelize } = require('sequelize')
module.exports = {
  up: ({ context: queryInterface }) => {
    return queryInterface.addColumn(
      'Movie',
      'uuid',
      {
        type: Sequelize.STRING,
      },
    )
  },

  down: ({ context: queryInterface }) => {
    return queryInterface.removeColumn('Movie', 'uuid')
  },
};