'use strict'

const path = require('path')

module.exports = {
  entry: {
    main: [
      './src/js/main.js',
      './src/sass/main.sass'
    ]
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: './static/js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true
            }
          }
        ]
      }
    ]
  }
}
