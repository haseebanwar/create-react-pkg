#!/usr/bin/env node

import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { program } from 'commander';
import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';

import { rollup, watch } from 'rollup';
// import clearConsole from 'react-dev-utils/clearConsole';
import { run as jestRun } from 'jest';

import {
  createRollupInputOptions,
  createRollupOutputs,
} from './rollup/rollupConfig';
import {
  getAuthorName,
  composePackageJSON,
  getPackageCMD,
  makePackageDeps,
  makeInstallCommand,
  logBuildError,
  logBuildWarnings,
  safePackageName,
} from './utils';
import { paths } from './paths';
import { templates } from './constants';
import packageJSON from '../package.json';

program.name(packageJSON.name);
program.version(packageJSON.version);

function writeCjsEntryFile(packageName) {
  const safeName = safePackageName(packageName);
  const contents = `'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/${safeName}.min.js');
} else {
  module.exports = require('./cjs/${safeName}.js');
}`;
  return fs.outputFileSync(path.join(paths.appDist, 'index.js'), contents);
}

program
  .argument('<package-directory>', 'package directory')
  .description('Create a new JavaScript package')
  .option('--use-npm', 'use NPM for installing package dependencies')
  .option('-t, --template <test>', 'specify a template for created package')
  .action(async (projectDirectory, flags) => {
    try {
      const { useNpm, template = 'basic' } = flags;

      // check if template is valid
      if (!templates.includes(template)) {
        console.error(
          'Invalid template, please use one of the following supported templates'
        );

        // print valid templates
        templates.forEach((supportedTemplate) => {
          console.log(`- ${chalk.cyan(supportedTemplate)}`);
        });

        process.exit(1);
      }

      const useTypescript = template === 'typescript';
      const projectPath = path.resolve(projectDirectory);
      const packageName = path.basename(projectPath);

      // validate package name
      const {
        validForNewPackages,
        errors: packageNameErrors,
        warnings: packageNameWarnings,
      } = validatePackageName(packageName);

      if (!validForNewPackages) {
        console.log(
          chalk.red(`Invalid package name ${chalk.green(`"${packageName}"`)}`)
        );

        [...(packageNameErrors || []), ...(packageNameWarnings || [])].forEach(
          (error) => {
            console.log(chalk.red(`  - ${error}`));
          }
        );
        console.log(chalk.red('Please use a different package name'));
        process.exit(1);
      }

      // create package directory if it doesn't exist
      fs.ensureDirSync(projectPath);

      // throw an error if package folder is not empty
      const files = fs.readdirSync(projectPath);
      if (files.length) {
        console.log(
          chalk.red(
            `Please make sure that your package directory ${chalk.green(
              `"${packageName}"`
            )} is empty`
          )
        );
        process.exit(1);
      }

      console.log(`Creating a new package in ${chalk.green(projectPath)}`);

      // copy the template
      await fs.copy(
        path.resolve(__dirname, `../templates/${template}`),
        projectPath,
        {
          overwrite: true,
        }
      );

      // fix gitignore
      // await fs.move(
      //   path.resolve(projectPath, './gitignore'),
      //   path.resolve(projectPath, './.gitignore')
      // );

      // get author name
      const author = getAuthorName();

      // if author is not present prompt for name

      // install deps
      const dependencies = makePackageDeps(useTypescript);
      console.log('Installing packages. This might take a couple of minutes.');

      dependencies.forEach((dep) => console.log(`  - ${dep}`));
      process.chdir(projectPath);

      // generate package.json
      const pkg = composePackageJSON(packageName, author, useTypescript);
      fs.outputJSONSync(path.resolve(projectPath, 'package.json'), pkg, {
        spaces: 2,
      });

      // decide whether to use npm or yarn for installing deps
      const packageCMD = getPackageCMD(useNpm);

      execSync(makeInstallCommand(packageCMD, dependencies)).toString();

      process.exit(0);
    } catch (error) {
      console.log('error', error);
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Creates a distributable build of package')
  .action(async () => {
    // node env is used by many tools like browserslist
    process.env.NODE_ENV = 'production';
    process.env.BABEL_ENV = 'production';

    let bundle;
    let buildFailed = false;
    let hasWarnings = false;

    try {
      // clearConsole();
      console.log(chalk.cyan('Creating an optimized build...'));

      fs.emptyDirSync(paths.appDist);

      const appPackage = fs.readJSONSync(paths.appPackageJson);
      const isTypescriptConfigured = fs.existsSync(paths.tsconfigJson);

      const rollupInputs = createRollupInputOptions(
        isTypescriptConfigured,
        appPackage.peerDependencies
      );
      bundle = await rollup({
        ...rollupInputs,
        onwarn: (warning, warn) => {
          // print this message only when there were no previous warnings for this build
          if (!hasWarnings) {
            console.log(chalk.yellow('Compiled with warnings.'));
          }
          hasWarnings = true;
          logBuildWarnings(warning, warn);
        },
      });

      writeCjsEntryFile(appPackage.name);

      const outputOptions = createRollupOutputs(appPackage.name);

      for (const output of outputOptions) {
        await bundle.write(output);
      }

      console.log(chalk.green('Build succeeded!'), process.env.NODE_ENV);
    } catch (error) {
      buildFailed = true;
      // clearConsole();
      console.log(chalk.red('Failed to compile.'));
      logBuildError(error);
    } finally {
      if (bundle) {
        await bundle.close();
      }
      process.exit(buildFailed ? 1 : 0);
    }
  });

program
  .command('watch')
  .description('Creates a distributable build of package')
  .action(async () => {
    // node env is used by many tools like browserslist
    process.env.NODE_ENV = 'development';
    process.env.BABEL_ENV = 'development';

    let hasErrors = false;
    let hasWarnings = false;

    const appPackage = fs.readJSONSync(paths.appPackageJson);
    const isTypescriptConfigured = fs.existsSync(paths.tsconfigJson);

    const rollupInputs = createRollupInputOptions(
      isTypescriptConfigured,
      appPackage.peerDependencies
    );
    const rollupOutputs = createRollupOutputs(appPackage.name);

    const watcher = watch({
      ...rollupInputs,
      output: rollupOutputs,
      watch: {
        silent: true,
        include: ['src/**'],
        exclude: ['node_modules/**'],
      },
      onwarn: (warning, warn) => {
        // clear console only if there were no previous warnings for this round of build
        if (!hasWarnings) {
          // clearConsole();
          console.log(chalk.yellow('Compiled with warnings.'));
        }
        hasWarnings = true;
        logBuildWarnings(warning, warn);
      },
    });

    watcher.on('event', (evt) => {
      if (evt.result) {
        evt.result.close();
      }

      if (evt.code === 'START') {
        // clearConsole();
        console.log(chalk.yellow(`Compiling...`));
        writeCjsEntryFile(appPackage.name);
      }

      if (evt.code === 'ERROR') {
        hasErrors = true;
        // clearConsole();
        console.log(chalk.red(`Failed to compile.`));
        logBuildError(evt.error);
      }

      if (evt.code === 'END') {
        if (!hasErrors && !hasWarnings) {
          // clearConsole();
          console.log(chalk.green('Compiled successfully!'));
        }

        // reset for the next round of build
        hasErrors = false;
        hasWarnings = false;
      }
    });
  });

program
  .command('test')
  .description('Jest test runner')
  .allowUnknownOption()
  .action(async () => {
    process.env.NODE_ENV = 'test';
    process.env.BABEL_ENV = 'test'; // because we're using babel for transforming JSX

    const argv = process.argv.slice(2);

    const jestConfig = {
      testEnvironment: 'jsdom',
      transform: {
        '.(js|jsx)$': require.resolve('./jest/babelTransform.js'),
        '.(ts|tsx)$': require.resolve('ts-jest'),
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
  });

program.parse(process.argv);
