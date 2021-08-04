'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EpisodeFile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      EpisodeFile.belongsTo(models.Season)
      EpisodeFile.belongsTo(models.Series)
    }
  }
  EpisodeFile.init({
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
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: false,
      }
    },
    episode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING
    },
    metadata: {
      type: DataTypes.JSON
    }
  }, {
    sequelize,
    freezeTableName: true,
    modelName: 'EpisodeFile',
  });
  return EpisodeFile
}