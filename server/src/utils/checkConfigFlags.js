const { Library } = require('../database/models')

module.exports = {
  check: async (userConfig) => {
    try {
      if (userConfig["RESET_LIBRARY_CRAWLING"]) {
        await Library.update(
          { crawling: false },
          { where: { crawling: true  }}
        )
      }
      console.log('...user config checks, done.')
    } catch (err) {
      throw err
    }
  }
}