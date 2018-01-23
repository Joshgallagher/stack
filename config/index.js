'use strict'

module.exports = {
  build: {
    env: require('./prod.env')
  },
  dev: {
    env: require('./dev.env'),
    port: process.env.PORT || 8080,
    autoOpenBrowser: false
  }
}
