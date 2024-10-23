const { merge } = require('webpack-merge');  // Updated the import for `webpack-merge`
const commonConfig = require('./webpack.common.js');

module.exports = (env, argv) => {
  const mode = argv.mode || 'development';  // Default to 'development' if no mode is provided
  const envConfig = require(`./webpack.${mode === 'production' ? 'prod' : 'dev'}.js`);
  
  return merge(commonConfig, envConfig);
};
