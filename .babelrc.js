module.exports = {
  ignore: ['**/*.d.ts'],
  plugins: [
    '@babel/plugin-transform-runtime',
    ['babel-plugin-istanbul', {
      exclude: ['**/*.spec.ts', '**/test/**']
    }]
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        forceAllTransforms: true
      }
    ],
    '@babel/preset-typescript'
  ],
  sourceMaps: 'inline',
  sourceRoot: 'ocsdk:///'
};
