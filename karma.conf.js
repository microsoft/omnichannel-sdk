// Karma configuration
// Generated on Sun Dec 29 2019 18:25:29 GMT+0200 (Eastern European Standard Time)

const mode = 'development';
const webpackConfig = require('./webpack.config')({}, { mode });
const path = require('path');
const puppeteer = require('puppeteer');
process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: ['test/index.ts'],

    plugins: [
      'karma-jasmine',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-coverage-istanbul-reporter',
      'karma-spec-reporter',
      '@dhigroup/karma-vsts-reporter',
    ],

    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/index.ts': ['webpack']
    },
    webpack: {
      module: webpackConfig.module,
      resolve: webpackConfig.resolve,
      mode
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage-istanbul', 'vsts'],

    webpackMiddleware: {
      noInfo: true
    },

    coverageIstanbulReporter: {
      reports: [ 'html', 'text-summary', 'lcovonly', 'cobertura' ],
      dir: path.join(__dirname, 'test-results/coverage'),
      fixWebpackSourcePaths: true,
      'report-config': {
        html: { outdir: 'html' }
      }
    },

    vstsReporter: {
      outputDir: 'test-results',
      outputFile: 'test.xml'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // Use ChromeHeadlessCI in CI environments (GitHub Actions, etc.)
    browsers: process.env.CI ? ['ChromeHeadlessCI'] : ['ChromeHeadless'],

    // Custom launcher configuration for CI environments
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  })
}
