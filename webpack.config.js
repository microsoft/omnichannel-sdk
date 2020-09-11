const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

module.exports = (env, argv) => {
  const {mode} = argv;
  const envConfig = require(`./webpack.${mode === 'production'? 'prod': 'dev'}.js`);
  return webpackMerge(commonConfig, envConfig);
}
