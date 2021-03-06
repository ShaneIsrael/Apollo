const { Sequelize } = require('sequelize')
// https://stackoverflow.com/questions/23128816/sequelize-js-ondelete-cascade-is-not-deleting-records-sequelize/55323664#55323664
module.exports = {
  up: ({ context: queryInterface }) => {
    return queryInterface.createTable('Series', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      libraryId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        allowNull: false,
        references: {
          model: 'Library', // name of Target model
          key: 'id' // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: false,
        }
      },
      formatted_name: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: false,
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: ({ context: queryInterface }) => {
    return queryInterface.dropTable('Series');
  }
};