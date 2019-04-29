const path = require('path');

const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');

const NODE_ENV = process.env.NODE_ENV;

module.exports = (env, argv) => {
  const config = {
    entry: {
      index: path.resolve('src', 'client', 'index.tsx'),
    },
    output: {
      filename: '[name].bundle.js',
      chunkFilename: '[name].chunk.js',
      path: path.resolve('dist', 'public'),
      publicPath: '/public/',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: './tsconfig.client.json',
        }),
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({
          NODE_ENV: process.env.NODE_ENV,
        }),
      }),
      new LoadablePlugin({ writeToDisk: { filename: path.resolve('dist') } }),
    ],
    optimization: {
      minimize: argv.mode === 'production',
      // splitChunks: {
      //   name: 'dist/public/commons/index',
      //   chunks: 'initial',
      //   cacheGroups: {
      //     vendors: {
      //       test: /node_modules/,
      //       name: 'dist/public/commons/vendors',
      //       chunks: 'initial'
      //     },
      //   },
      // },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.client.json',
            },
          },
        },
      ],
    },
  };

  if (NODE_ENV === 'production') {
    console.log(`Building as production...`);
    config.optimization.minimize = true;

    if (process.env.ANALYSIS === 'true') {
      console.log(`Building for analyze...`);
      config.plugins.push(new BundleAnalyzerPlugin());
    }
  } else {
    console.log('Building as development...');
    config.devtool = 'inline-source-map';
  }
  return config;
};
