const { Sequelize } = require('sequelize')
module.exports = {
  up: ({ context: queryInterface }) => {
    return queryInterface.addColumn(
      'Series',
      'uuid',
      {
        type: Sequelize.STRING
      },
    )
  },

  down: ({ context: queryInterface }) => {
    return queryInterface.removeColumn('Series', 'uuid')
  },
};