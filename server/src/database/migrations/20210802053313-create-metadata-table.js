'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Metadata', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      movieId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        allowNull: true,
        references: {
          model: 'Movie', // name of Target model
          key: 'id' // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
      },
      seriesId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        allowNull: true,
        references: {
          model: 'Series', // name of Target model
          key: 'id' // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
      },
      tmdbId: {
        type: Sequelize.INTEGER,
      },
      imdbId: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING
      },
      tmdb_poster_path: {
        type: Sequelize.STRING,
      },
      tmdb_backdrop_path: {
        type: Sequelize.STRING,
      },
      local_poster_path: {
        type: Sequelize.STRING,
      },
      local_backdrop_path: {
        type: Sequelize.STRING,
      },
      release_date: {
        type: Sequelize.STRING,
      },
      runtime: {
        type: Sequelize.INTEGER,
      },
      tmdb_rating: {
        type: Sequelize.DOUBLE
      },
      genres: {
        type: Sequelize.STRING,
      },
      overview: {
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
    return queryInterface.dropTable('Metadata');
  }
};
