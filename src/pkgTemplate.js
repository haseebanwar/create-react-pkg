import packageJSON from '../package.json';

// name and author fields will be dynamic
export const basePackageJSON = {
  version: '0.1.0',
  description: '',
  files: ['dist'],
  license: 'MIT',
  scripts: {
    start: `create-react-package watch`,
    build: `create-react-package build`,
    test: `create-react-package test`,
  },
  peerDependencies: {
    react: '^17.0.2',
    'react-dom': '^17.0.2',
  },
  keywords: [],
  eslintConfig: {
    extends: ['react-app', 'react-app/jest'],
  },
};

export const dependencies = [];
export const tsDependencies = [];
// export const dependencies = [packageJSON.name, 'react', 'react-dom'];
// export const tsDependencies = [
//   '@types/react',
//   '@types/react-dom',
//   '@types/jest',
//   '@types/node',
//   'typescript',
//   'tslib',
// ];
