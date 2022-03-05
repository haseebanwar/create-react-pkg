import { run as jestRun } from 'jest';
import { paths } from '../paths';

export function test() {
  process.env.NODE_ENV = 'test';
  process.env.BABEL_ENV = 'test'; // because we're using babel for transforming JSX

  const argv = process.argv.slice(2);

  const jestConfig = {
    testEnvironment: 'jsdom',
    transform: {
      '.(js|jsx)$': require.resolve('./jest/babelTransform.js'),
      '.(ts|tsx)$': require.resolve('ts-jest'),
      '.(css|scss|sass|styl|stylus|less)$': require.resolve(
        './jest/cssTransform.js'
      ),
    },
    // transformIgnorePatterns already includes node_modules
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'], // it is default, explicitly specifying
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
    rootDir: paths.appRoot,
    watchPlugins: [
      require.resolve('jest-watch-typeahead/filename'),
      require.resolve('jest-watch-typeahead/testname'),
    ],
  };

  argv.push('--config', JSON.stringify(jestConfig));

  jestRun(argv);
}
