import { run as jestRun } from 'jest';
import chalk from 'chalk';
import { paths } from '../paths';
import { checkTypescriptSetup } from '../utils';

export function test(cleanArgs) {
  try {
    process.env.NODE_ENV = 'test';
    process.env.BABEL_ENV = 'test'; // because we're using babel for transforming JSX

    const isTypescriptConfigured = checkTypescriptSetup();

    const jestConfig = {
      testEnvironment: 'jsdom',
      transform: {
        '.(js|jsx)$': require.resolve('../jest/babelTransform.js'),
        ...(isTypescriptConfigured && {
          '.(ts|tsx)$': require.resolve('ts-jest'),
        }),
        '.(css|scss|sass|styl|stylus|less)$': require.resolve(
          '../jest/cssTransform.js'
        ),
      },
      // transformIgnorePatterns already includes node_modules
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'], // it is default, explicitly specifying
      collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
      testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
      rootDir: paths.packageRoot,
      watchPlugins: [
        require.resolve('jest-watch-typeahead/filename'),
        require.resolve('jest-watch-typeahead/testname'),
      ],
    };

    cleanArgs.push('--config', JSON.stringify(jestConfig));

    // pass any other options directly to jest
    jestRun(cleanArgs);
  } catch (error) {
    console.error(chalk.red(`Failed to run tests: ${error.message}`));
    console.error('error', error);
    process.exit(1);
  }
}
