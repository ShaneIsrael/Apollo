'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Season extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Season.belongsTo(models.Series)
      Season.hasMany(models.Episode)
    }
  }
  Season.init({
    seriesId: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
    },
    season: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    tmdbId: {
      type: DataTypes.INTEGER
    },
    tmdb_poster_path: {
      type: DataTypes.STRING,
    },
    local_poster_path: {
      type: DataTypes.STRING,
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Season',
  });
  return Season
}