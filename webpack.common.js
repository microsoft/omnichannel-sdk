const path = require('path');

module.exports = {
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      process: require.resolve('process/browser'),
      crypto: require.resolve('crypto-browserify'), // Add fallback for 'crypto'
      buffer: require.resolve('buffer/'), // Fallback for 'buffer'
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'), // Fallback for 'vm'
    }
  },
  output: {
    filename: 'SDK.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'window'
  }
}
