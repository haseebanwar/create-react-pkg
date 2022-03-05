// name and author fields will be dynamic
export const basePackageJSON = {
  version: '0.1.0',
  description: '',
  files: ['dist'],
  license: 'MIT',
  scripts: {
    start: `react-package-scripts start`,
    build: `react-package-scripts build`,
    test: `react-package-scripts test`,
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

// export const dependencies = [];
// export const tsDependencies = [];
// export const storybookDependencies = [];

export const dependencies = [
  // 'react-package-scripts',
  // '@haseebanwar/react-package-scripts',
  'react',
  'react-dom',
];
export const tsDependencies = [
  '@types/react',
  '@types/react-dom',
  '@types/jest',
  '@types/node',
  'typescript',
  'tslib',
];
export const storybookDependencies = [
  '@babel/core',
  '@storybook/addon-actions',
  '@storybook/addon-essentials',
  '@storybook/addon-interactions',
  '@storybook/addon-links',
  '@storybook/react',
  '@storybook/testing-library',
  'babel-loader',
];
