const path = require('path');

console.log("webpack config: prod");
module.exports = {
  entry: './lib/index.js',
  output: {
    filename: 'SDK.min.js'
  },
  optimization: {
    minimize: true
  }
}
