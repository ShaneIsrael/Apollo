'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Library extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Library.hasMany(models.Series)
      Library.hasMany(models.Movie)
    }
  };
  Library.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: false,
      }
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: false,
      }
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: false,
      }
    },
    type: {
      type: DataTypes.ENUM,
      values: ['series', 'movie']
    },
    description: DataTypes.STRING,
    misc: DataTypes.JSON
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Library',
  });
  return Library
}