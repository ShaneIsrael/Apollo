module.exports = {
  development: {
    dialect: 'sqlite',
    storage: 'dev.sqlite',
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
    storage: 'prod.sqlite',
    logging: false,
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
}
