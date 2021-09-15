'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Metadata extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Metadata.belongsTo(models.Series)
      Metadata.belongsTo(models.Movie)
    }
  }
  Metadata.init({
    movieId: {
      type: DataTypes.INTEGER,
      foreignKey: true,
    },
    seriesId: {
      type: DataTypes.INTEGER,
      foreignKey: true,
    },
    tmdbId: {
      type: DataTypes.INTEGER,
    },
    imdbId: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING
    },
    tmdb_poster_path: {
      type: DataTypes.STRING,
    },
    tmdb_backdrop_path: {
      type: DataTypes.STRING,
    },
    local_poster_path: {
      type: DataTypes.STRING,
    },
    local_backdrop_path: {
      type: DataTypes.STRING,
    },
    release_date: {
      type: DataTypes.STRING,
    },
    runtime: {
      type: DataTypes.INTEGER,
    },
    tmdb_rating: {
      type: DataTypes.DOUBLE
    },
    genres: {
      type: DataTypes.STRING,
    },
    overview: {
      type: DataTypes.STRING,
    },
    cast: {
      type: DataTypes.JSON,
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Metadata',
  });
  return Metadata
}