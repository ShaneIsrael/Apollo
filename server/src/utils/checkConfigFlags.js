const ENVIRONMENT = process.env.NODE_ENV || 'production'
const fs = require('fs')
const path = require('path')

const { Library } = require('../database/models')

let userConfig
if (ENVIRONMENT === 'production') {
  userConfig = JSON.parse(fs.readFileSync(path.join(path.dirname(process.execPath), 'config.json')))
} else {
  userConfig = require('../../config.json')
}


async function check() {
  if (userConfig["RESET_LIBRARY_CRAWLING"]) {
    await Library.update(
      { crawling: false },
      { where: { crawling: true  }}
    )
  }
}
check()