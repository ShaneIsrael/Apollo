'use strict';
//https://api.themoviedb.org/3/tv/30977/season/1/episode/1?api_key=4b107ae9be9d72628597b37a27ff3ad8&language=en-US
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
      Episode.belongsTo(models.Series)
      Episode.belongsTo(models.Season)
    }
  }
  Episode.init({
    seriesId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      foreignKey: true,
    },
    seasonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      foreignKey: true,
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
    },
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Episode',
  });
  return Episode
}