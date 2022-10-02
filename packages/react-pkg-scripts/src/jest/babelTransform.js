import babelJest from 'babel-jest';

// custom jest transformer for transforming js and jsx files with babel
export default babelJest.createTransformer({
  presets: [
    [require.resolve('@babel/preset-env')],
    [require.resolve('@babel/preset-react')],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  babelrc: false,
  configFile: false,
});
