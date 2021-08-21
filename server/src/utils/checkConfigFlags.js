const { Library } = require('../database/models')
const logger = require('../logger')

module.exports = {
  check: async (userConfig) => {
    try {
      if (userConfig["RESET_LIBRARY_CRAWLING"]) {
        await Library.update(
          { crawling: false },
          { where: { crawling: true  }}
        )
      }
      logger.info('...user config checks, done.')
    } catch (err) {
      throw err
    }
  }
}