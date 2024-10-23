const path = require('path');
const webpack = require('webpack');

console.log("webpack config: dev");
module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.ts$/,
        exclude: [
          /node_modules/,
          /test/
        ],
        enforce: 'post',
        use: {
          loader: 'babel-loader',
        }
      }
    ],
  },
  devtool: 'inline-source-map'
}
