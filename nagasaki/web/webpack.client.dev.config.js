'use strict';

const path = require('path');

const webpack = require('webpack');

const config = {
  mode: 'development',
  entry: ['webpack-hot-middleware/client', path.resolve('src', 'client', 'index.tsx')],
  devtool: 'inline-cheap-module-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()]
};

module.exports = config;
