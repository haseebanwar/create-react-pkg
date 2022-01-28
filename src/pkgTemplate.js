// name and author fields will be dynamic
export const basePackageJSON = {
  version: '0.1.0',
  description: '',
  main: '',
  license: 'MIT',
  scripts: {
    build: 'babel src -d lib',
  },
  keywords: [],
};

export const dependencies = ['@babel/cli', '@babel/core', '@babel/preset-env'];
