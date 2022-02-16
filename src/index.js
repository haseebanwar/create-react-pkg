#!/usr/bin/env node

import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { program } from 'commander';
import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';

import { rollup, watch } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babelPresetReact from '@babel/preset-react';
import clearConsole from 'react-dev-utils/clearConsole';
import eslintFormatter from 'react-dev-utils/eslintFormatter';

import eslint from './plugins/rollup-eslint';
import {
  getAuthorName,
  composePackageJSON,
  getPackageCMD,
  makeInstallCommand,
} from './utils';
import { dependencies } from './pkgTemplate';
import packageJSON from '../package.json';

program.name(packageJSON.name);
program.version(packageJSON.version);

const buildDirectory = 'dist';
const rollupConfig = {
  input: 'src/index.js',
  plugins: [
    eslint({
      formatter: eslintFormatter,
    }),
    resolve(),
    commonjs({ include: /node_modules/ }),
    // json(),
    babel({ babelHelpers: 'bundled', presets: [babelPresetReact] }),
  ],
  external: ['react'],
};
const rollupOutputs = [
  {
    file: `${buildDirectory}/cjs/bundle.js`,
    format: 'cjs',
    sourcemap: true,
    // env: 'production',
    // exports: 'named',
    // Do not let Rollup call Object.freeze() on namespace import objects
    // (i.e. import * as namespaceImportObject from...) that are accessed dynamically.
    // freeze: false
  },
  {
    file: `${buildDirectory}/es/bundle.js`,
    format: 'es',
    sourcemap: true,
  },
];

program
  .argument('<package-directory>', 'package directory')
  .description('Create a new JavaScript package')
  .option('--use-npm', 'use NPM for installing package dependencies')
  .option('-t, --template <test>', 'specify a template for created package')
  .action(async (projectDirectory, flags) => {
    try {
      const template = 'basic';

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
      fs.outputJSONSync(path.resolve(projectPath, 'package.json'), pkg);

      // decide whether to use npm or yarn for installing deps
      const packageCMD = getPackageCMD(flags.useNpm);

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

    try {
      clearConsole();
      console.log(chalk.cyan('Creating an optimized build...'));

      fs.emptyDirSync(buildDirectory);

      bundle = await rollup({
        ...rollupConfig,
        onwarn: (warning, warn) => {
          const { code, plugin } = warning;

          if (code === 'PLUGIN_WARNING' && plugin === 'eslint') {
            const { firstWarning: firstWarningOfCurrentBuild, lintWarnings } =
              warning;

            if (firstWarningOfCurrentBuild) {
              console.log(chalk.yellow('Compiled with warnings.'));
            }
            console.log(lintWarnings || warning);
            return;
          }

          // Use default for everything else
          warn(warning);
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

      console.log(error.lintErrors || error);
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

    const watcher = watch({
      ...rollupConfig,
      output: rollupOutputs,
      watch: {
        silent: true,
        include: ['src/**'],
        exclude: ['node_modules/**'],
      },
      onwarn: (warning, warn) => {
        const { code, plugin } = warning;

        if (code === 'PLUGIN_WARNING' && plugin === 'eslint') {
          hasWarnings = true;

          const { firstWarning: firstWarningOfCurrentBuild, lintWarnings } =
            warning;

          if (firstWarningOfCurrentBuild) {
            clearConsole();
            console.log(chalk.yellow('Compiled with warnings.'));
          }
          console.log(lintWarnings || warning);
          return;
        }

        // Use default for everything else
        warn(warning);
      },
    });

    watcher.on('event', (evt) => {
      if (evt.result) {
        evt.result.close();
      }

      if (evt.code === 'START') {
        clearConsole();
        console.log(chalk.yellow(`Compiling...`));
        fs.emptyDirSync(buildDirectory);
      }

      if (evt.code === 'ERROR') {
        hasErrors = true;

        clearConsole();
        console.log(chalk.red(`Failed to compile.`));
        const { lintErrors } = evt.error;
        console.log(lintErrors || evt.error);
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
