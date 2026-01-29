const path = require('path');

console.log("webpack config: dev");
module.exports = {
  devServer: {
    static: path.join(__dirname, 'dist'),
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
          loader: '@jsdevtools/coverage-istanbul-loader',
          options: { esModules: true }
        }
      }
    ],
  },
  devtool: 'inline-source-map'
}
