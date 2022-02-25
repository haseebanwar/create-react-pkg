import babelJest from 'babel-jest';
// import 'regenerator-runtime/runtime';

module.exports = babelJest.createTransformer({
  presets: [
    [require.resolve('@babel/preset-react')],
    [require.resolve('@babel/preset-env')],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  babelrc: false,
  configFile: false,
});
