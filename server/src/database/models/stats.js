'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Stats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

    }
  }
  Stats.init({
    libraryId: {
      type: DataTypes.INTEGER,
      foreignKey: true,
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    json: {
      type: DataTypes.JSON,
      validate: {
        notEmpty: true,
      }
    },
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'Stats',
  });
  return Stats
}