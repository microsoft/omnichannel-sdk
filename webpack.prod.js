const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

console.log("webpack config: prod");
class DtsBundlePlugin {
  apply = (compiler) => {
    compiler.plugin('done', () => {
      const dts = require('dts-bundle');
      const fs = require('fs');

      const outputDir = path.resolve(__dirname, `dist`);

      // Bundle .d.ts files
      dts.bundle({
        name: 'OCSDK',
        main: `${outputDir}/**/*.d.ts`,
        out: './SDK.d.ts',
        removeSource: true,
        outputAsModuleFolder: true // to use npm in-package typings
      });

      // Clean up
      const list = fs.readdirSync(`${outputDir}`);
      for (const el of list) {
        const filename = path.resolve(outputDir, el);
        const stat = fs.statSync(filename);

        if (stat.isDirectory()) {
          const isEmpty = fs.readdirSync(filename).length === 0;
          if (isEmpty) {
            fs.rmdirSync(filename);
          }
        }
      }
    });
  };
}

module.exports = {
  entry: './lib/index.js',
  output: {
    filename: 'SDK.min.js'
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
  plugins: [
    // new DtsBundlePlugin()
  ]
}
