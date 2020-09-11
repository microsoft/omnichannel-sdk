module.exports = {
  ignore: ['**/*.d.ts'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime'
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
