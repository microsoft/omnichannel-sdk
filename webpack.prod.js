const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

console.log("webpack config: prod");
module.exports = {
  entry: './lib/index.js',
  output: {
    filename: 'SDK.min.js'
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  }
}
