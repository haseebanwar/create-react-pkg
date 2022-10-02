// name and author fields will be dynamic
export const basePackageJSON = {
  version: '0.1.0',
  description: '',
  files: ['dist'],
  license: 'MIT',
  scripts: {
    start: `react-pkg-scripts watch`,
    build: `react-pkg-scripts build`,
    test: `react-pkg-scripts test`,
  },
  peerDependencies: {
    react: '>=17',
    'react-dom': '>=17',
  },
  keywords: ['react'],
  eslintConfig: {
    extends: ['react-app', 'react-app/jest'],
  },
  browserslist: {
    production: ['>0.2%', 'not dead', 'not op_mini all'],
    development: [
      'last 1 chrome version',
      'last 1 firefox version',
      'last 1 safari version',
    ],
  },
};

export const dependencies = ['react-pkg-scripts', 'react', 'react-dom'];
export const tsDependencies = [
  '@types/react',
  '@types/react-dom',
  '@types/jest@^27',
  '@types/node',
  // TODO: remove hard-coded version when this is fixed
  // https://github.com/facebook/create-react-app/issues/12150
  'typescript@~4.5.0',
  'tslib',
  'ts-jest@^27',
];
export const storybookDependencies = [
  '@babel/core',
  '@storybook/addon-actions',
  '@storybook/addon-essentials',
  '@storybook/addon-interactions',
  '@storybook/addon-links',
  '@storybook/builder-webpack4',
  '@storybook/manager-webpack4',
  '@storybook/react',
  '@storybook/testing-library',
  'babel-loader',
];
export const tsStorybookDependencies = ['@types/babel__core'];
