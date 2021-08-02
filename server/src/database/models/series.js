'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Series extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Series.belongsTo(models.Library)
      Series.hasOne(models.Metadata)
    }
  }
  Series.init({
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
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Series',
  });
  return Series
}