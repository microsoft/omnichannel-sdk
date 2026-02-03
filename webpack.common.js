const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      process: require.resolve('process/browser')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser'
    })
  ],
  output: {
    filename: 'SDK.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'window'
  }
}
