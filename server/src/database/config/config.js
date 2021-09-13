const path = require('path')
const config = require(path.join(process.cwd(), 'src/config/index.js'))[process.env.NODE_ENV || 'production']
module.exports = {
  development: {
    dialect: 'sqlite',
    storage: config.appdata +'/'+ config.dbname,
    retry: {
      match: [
        /SQLITE_BUSY/
      ],
      name: 'query',
      max: 5
    },
    transactionType: 'IMMEDIATE',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      maxactive: 1,
      acquire: 30000,
      idle: 20000,
    }
  },
  production: {
    dialect: 'sqlite',
    storage: config.appdata +'/'+ config.dbname,
    retry: {
      match: [
        /SQLITE_BUSY/
      ],
      name: 'query',
      max: 5
    },
    transactionType: 'IMMEDIATE',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      maxactive: 1,
      acquire: 30000,
      idle: 20000
    }
  },
}
