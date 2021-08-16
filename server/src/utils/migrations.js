const path = require('path')
const { Sequelize } = require('sequelize')
const { Umzug, SequelizeStorage } = require('umzug')

module.exports = {
  run: async (config, ENVIRONMENT) => {
    try {
      const dbconfig = require('../database/config/config.js')[ENVIRONMENT]
      // Run Migrations
      dbconfig.storage = path.join(config.appdata, config.dbname)
      
      const sequelize = new Sequelize(dbconfig)
      
      const umzug = new Umzug({
        migrations: {
          glob: __dirname + '../database/migrations/*.js',
        },
        context: sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize }),
        logger: console,
      })
      
      await umzug.up()
      console.log('...database checks, done.')

    } catch (err) {
      throw err
    }
  }
}