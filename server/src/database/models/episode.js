'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Episode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Episode.belongsTo(models.Season)
      Episode.belongsTo(models.Series)
    }
  }
  Episode.init({
    seasonId: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
    },
    seriesId: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
    },
    tmdbId: {
      type: DataTypes.INTEGER,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: false,
      }
    },
    name: {
      type: DataTypes.STRING
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    overview: {
      type: DataTypes.STRING
    },
    tmdb_still_path: {
      type: DataTypes.STRING,
    },
    local_still_path: {
      type: DataTypes.STRING,
    },
    air_date: {
      type: DataTypes.STRING,
    },
    season_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    episode_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tmdb_rating: {
      type: DataTypes.DOUBLE
    },
    file_probe_data: {
      type: DataTypes.JSON
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Episode',
  });
  return Episode
}