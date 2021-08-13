'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Stats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      libraryId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: {
          model: 'Library', // name of Target model
          key: 'id' // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        }
      },
      json: {
        type: Sequelize.JSON,
        validate: {
          notEmpty: true,
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

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Stats');
  }
};
