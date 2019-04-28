'use strict';

const path = require('path');

const { smart } = require('webpack-merge');
const common = require('./webpack.config');

const config =
  process.env.NODE_ENV === 'production'
    ? require('./webpack.client.prod.config')
    : require('./webpack.client.dev.config');

const base = {
  output: {
    path: path.resolve('dist', 'client')
  }
};

module.exports = smart(common, base, config);
