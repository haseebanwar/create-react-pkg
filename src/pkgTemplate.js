// name and author fields will be dynamic
export const basePackageJSON = {
  version: '0.1.0',
  description: '',
  main: '', // TODO: define cjs entry point
  module: '', // TODO: define es entry point
  license: 'MIT',
  scripts: {
    build: 'create-js-package build',
  },
  peerDependencies: {
    react: '^17.0.2',
    'react-dom': '^17.0.2',
  },
  keywords: [],
};

export const dependencies = [];
