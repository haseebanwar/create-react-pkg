// name and author fields will be dynamic
export const basePackageJSON = {
  version: '0.1.0',
  description: '',
  main: 'dist/cjs/bundle.js', // TODO: define cjs entry point
  module: 'dist/es/bundle.js', // TODO: define es entry point
  // files: [], // TODO: define files
  license: 'MIT',
  scripts: {
    start: `create-react-package watch`,
    build: `create-react-package build`,
  },
  peerDependencies: {
    react: '^17.0.2',
    'react-dom': '^17.0.2',
  },
  keywords: [],
  eslintConfig: {
    extends: ['react-app'],
  },
};

export const dependencies = [];
// export const dependencies = [packageJSON.name, 'react', 'react-dom'];
