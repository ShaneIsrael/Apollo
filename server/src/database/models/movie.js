'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Movie extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Movie.belongsTo(models.Library)
      Movie.hasOne(models.Metadata)
      Movie.hasMany(models.MovieFile)
    }
  }
  Movie.init({
    libraryId: {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: false,
      }
    },
    formatted_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: false,
      }
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    uuid: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Movie',
  });
  return Movie
}