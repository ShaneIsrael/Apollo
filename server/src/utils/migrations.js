const path = require('path')
const { Sequelize } = require('sequelize')
const { Umzug, SequelizeStorage } = require('umzug')
const logger = require('../logger/index.js')

module.exports = {
  run: async (config, ENVIRONMENT) => {
    try {
      const dbconfig = require(path.join(process.cwd(), 'src/database/config/config.js'))[ENVIRONMENT]
      // Run Migrations
      dbconfig.storage = path.join(config.appdata, config.dbname)
      
      const sequelize = new Sequelize(dbconfig)
      
      const umzug = new Umzug({
        migrations: {
          glob: __dirname + '/../database/migrations/*.js',
        },
        context: sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize }),
        logger: console,
      })
      
      await umzug.up()
      logger.info('...database checks, done.')

    } catch (err) {
      throw err
    }
  }
}