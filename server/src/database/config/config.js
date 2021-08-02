module.exports = {
  development: {
    dialect: 'sqlite',
    storage: 'dev.sqlite',
    logging: false,
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
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
