'use strict'

process.env.NODE_ENV = 'production'

const ora = require('ora')
const chalk = require('chalk')
const webpack = require('webpack')
const productionWebpackConfig = require('./webpack.prod.config')

const spinner = ora('building for production...')
spinner.start()

webpack(productionWebpackConfig, (err, stats) => {
  spinner.stop()
  if (err) {
    throw err
  }

  console.log(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n\n')

  if (stats.hasErrors()) {
    console.log(chalk.red('Build failed with errors.\n'))
    process.exit(1)
  }

  console.log(chalk.green('Build complete.\n'))
})
