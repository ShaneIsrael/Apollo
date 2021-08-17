const { Sequelize } = require('sequelize');

module.exports = {
  up: async ({context: queryInterface}) => {
    await queryInterface.dropTable('EpisodeFile')
    await queryInterface.createTable('Episode', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      seasonId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        allowNull: false,
        references: {
          model: 'Season', // name of Target model
          key: 'id' // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
      },
      seriesId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        allowNull: false,
        references: {
          model: 'Series', // name of Target model
          key: 'id' // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
      },
      tmdbId: {
        type: Sequelize.INTEGER,
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: false,
        }
      },
      name: {
        type: Sequelize.STRING
      },
      overview: {
        type: Sequelize.STRING
      },
      tmdb_still_path: {
        type: Sequelize.STRING,
      },
      local_still_path: {
        type: Sequelize.STRING,
      },
      air_date: {
        type: Sequelize.STRING,
      },
      season_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      episode_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tmdb_rating: {
        type: Sequelize.DOUBLE
      },
      file_probe_data: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

  },

  down: async ({context: queryInterface}) => {
    await queryInterface.createTable('EpisodeFile', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      seasonId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        allowNull: false,
        references: {
          model: 'Season', // name of Target model
          key: 'id' // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
      },
      seriesId: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        allowNull: false,
        references: {
          model: 'Series', // name of Target model
          key: 'id' // key in Target model that we're referencing
        },
        onDelete: 'CASCADE',
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: false,
        }
      },
      episode: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING
      },
      metadata: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
    await queryInterface.dropTable('Episode')
  }
};
