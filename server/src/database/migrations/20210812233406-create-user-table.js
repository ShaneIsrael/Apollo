'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('User', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        }
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        }
      },
      token: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('User');
  }
};
