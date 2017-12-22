const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: ['babel-polyfill', path.resolve(__dirname, './src/index.js')],
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'bundle-min.js'
  },
  // watch: true,
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2017', 'react'],
          plugins: ['transform-class-properties']
        }
      }
    ]
  },
  devtool: 'cheap-module-source-map'
}