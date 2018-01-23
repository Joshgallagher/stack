'use strict'

const path = require('path')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.config')

module.exports = merge(baseWebpackConfig, {
  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    port: config.dev.port,
    open: config.dev.autoOpenBrowser,
    compress: true
  },
  module: {
    rules: [
      {
        test: /\.sass$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: true
    })
  ]
})
