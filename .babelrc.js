module.exports = {
  ignore: ['**/*.d.ts'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
    'babel-plugin-istanbul'
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        forceAllTransforms: true,
        targets: {
          esmodules: true 
        }
      }
    ],
    '@babel/preset-typescript'
  ],
  sourceMaps: 'inline',
  sourceRoot: 'ocsdk:///'
};
