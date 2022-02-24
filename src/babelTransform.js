import babelJest from 'babel-jest';
// import 'regenerator-runtime/runtime';

module.exports = babelJest.createTransformer({
  presets: [
    // [
    //   require.resolve('babel-preset-react-app'),
    //   {
    //     runtime: true ? 'automatic' : 'classic',
    //   },
    // ],
    [require.resolve('@babel/preset-react'), { runtime: 'automatic' }],
    [
      require.resolve('@babel/preset-env'),
      {
        targets: '> 0.25%, not dead',
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  babelrc: false,
  configFile: false,
});
