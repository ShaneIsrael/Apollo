'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MovieFile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MovieFile.belongsTo(models.Movie)
    }
  }
  MovieFile.init({
    movieId: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: false,
      }
    },
    metadata: {
      type: DataTypes.JSON
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'MovieFile',
  });
  return MovieFile
}