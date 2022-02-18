#!/usr/bin/env node

import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { program } from 'commander';
import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';

import { rollup, watch } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import babelPresetReact from '@babel/preset-react';
import clearConsole from 'react-dev-utils/clearConsole';
import eslintFormatter from 'react-dev-utils/eslintFormatter';

import eslint from './plugins/rollup-eslint';
import {
  getAuthorName,
  composePackageJSON,
  getPackageCMD,
  makeInstallCommand,
  logBuildError,
  logBuildWarnings,
  safePackageName,
} from './utils';
import { paths } from './paths';
import { dependencies } from './pkgTemplate';
import packageJSON from '../package.json';

program.name(packageJSON.name);
program.version(packageJSON.version);

function createRollupConfig() {
  const isTypescriptConfigured = fs.existsSync(paths.tsconfigJson);

  return {
    input: `src/index.${isTypescriptConfigured ? 'tsx' : 'js'}`,
    plugins: [
      eslint({
        formatter: eslintFormatter,
      }),
      resolve(),
      commonjs({ include: /node_modules/ }),
      json(),
      isTypescriptConfigured &&
        typescript({
          tsconfig: './tsconfig.json',
        }),
      !isTypescriptConfigured &&
        babel({
          babelHelpers: 'bundled',
          presets: [babelPresetReact],
          // inputSourceMap: rollup-plugin-sourcemaps
        }),
      // rollup plugin replace
      // rollup plugin terser
    ].filter(Boolean),
    external: ['react'],
  };
}
function createRollupOutputs(packageName) {
  const safeName = safePackageName(packageName);
  return [
    {
      file: `${paths.appDist}/cjs/${safeName}.js`,
      format: 'cjs',
      sourcemap: true,
      // env: 'production',
      // exports: 'named',
      // Do not let Rollup call Object.freeze() on namespace import objects
      // (i.e. import * as namespaceImportObject from...) that are accessed dynamically.
      // freeze: false
    },
    {
      file: `${paths.appDist}/es/${safeName}.js`,
      format: 'es',
      sourcemap: true,
    },
  ];
}

program
  .argument('<package-directory>', 'package directory')
  .description('Create a new JavaScript package')
  .option('--use-npm', 'use NPM for installing package dependencies')
  .option('-t, --template <test>', 'specify a template for created package')
  .action(async (projectDirectory, flags) => {
    try {
      const { useNpm, template = 'basic' } = flags;

      // TODO define at one place
      if (!['basic', 'typescript'].includes(template)) {
        console.log('Invalid template');
        // print valid templates
        process.exit(1);
      }

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
      console.log('Installing packages. This might take a couple of minutes.');
      dependencies.forEach((dep) => console.log(`  - ${dep}`));
      process.chdir(projectPath);

      // generate package.json
      const pkg = composePackageJSON(packageName, author);
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
    let bundle;
    let buildFailed = false;
    let hasWarnings = false;

    try {
      clearConsole();
      console.log(chalk.cyan('Creating an optimized build...'));

      fs.emptyDirSync(paths.appDist);

      const appPackage = fs.readJSONSync(paths.appPackageJson);

      const rollupConfig = createRollupConfig();
      const rollupOutputs = createRollupOutputs(appPackage.name);

      bundle = await rollup({
        ...rollupConfig,
        onwarn: (warning, warn) => {
          // print this message only when there were no previous warnings for this build
          if (!hasWarnings) {
            console.log(chalk.yellow('Compiled with warnings.'));
          }
          hasWarnings = true;
          logBuildWarnings(warning, warn);
        },
      });

      for (const output of rollupOutputs) {
        await bundle.write(output);
      }

      console.log(chalk.green('Build succeeded!'));
    } catch (error) {
      buildFailed = true;
      clearConsole();
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
    let hasErrors = false;
    let hasWarnings = false;

    const appPackage = fs.readJSONSync(paths.appPackageJson);

    const rollupConfig = createRollupConfig();
    const rollupOutputs = createRollupOutputs(appPackage.name);

    const watcher = watch({
      ...rollupConfig,
      output: rollupOutputs,
      watch: {
        silent: true,
        include: ['src/**'],
        exclude: ['node_modules/**'],
      },
      onwarn: (warning, warn) => {
        // clear console only if there were no previous warnings for this round of build
        if (!hasWarnings) {
          clearConsole();
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
        clearConsole();
        console.log(chalk.yellow(`Compiling...`));
        fs.emptyDirSync(paths.appDist);
      }

      if (evt.code === 'ERROR') {
        hasErrors = true;
        clearConsole();
        console.log(chalk.red(`Failed to compile.`));
        logBuildError(evt.error);
      }

      if (evt.code === 'END') {
        if (!hasErrors && !hasWarnings) {
          clearConsole();
          console.log(chalk.green('Compiled successfully!'));
        }

        // reset for the next round of build
        hasErrors = false;
        hasWarnings = false;
      }
    });
  });

program.parse(process.argv);
