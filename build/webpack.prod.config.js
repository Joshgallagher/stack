'use strict'

const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const config = require('../config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlgin = require('optimize-css-assets-webpack-plugin')

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: [
      {
        test: /\.sass$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.build.env
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      hash: true,
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true
      },
    }),
    new UglifyJSPlugin(),
    new ExtractTextPlugin({
      filename: './static/css/[name].css'
    }),
    new OptimizeCSSPlgin()
  ]
})

module.exports = webpackConfig
