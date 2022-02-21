// name and author fields will be dynamic
export const basePackageJSON = {
  types: './index.d.ts',
  version: '0.1.0',
  description: '',
  files: ['dist'],
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
