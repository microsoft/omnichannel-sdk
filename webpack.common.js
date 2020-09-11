const path = require('path');

module.exports = {
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'SDK.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'window'
  }
}
