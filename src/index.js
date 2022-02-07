#!/usr/bin/env node

import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { program } from 'commander';
import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';

import { rollup } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babelPresetReact from '@babel/preset-react';

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
      console.log('this is build');

      bundle = await rollup({
        input: 'src/index.js',
        plugins: [
          babel({ babelHelpers: 'bundled', presets: [babelPresetReact] }),
          resolve(),
          commonjs(),
        ],
        external: ['react'],
      });

      await bundle.write({
        file: 'dist/cjs/bundle.js',
        format: 'cjs',
        sourcemap: true,
      });
      await bundle.write({
        file: 'dist/es/bundle.js',
        format: 'es',
        sourcemap: true,
      });
    } catch (error) {
      console.log('error', error);
      buildFailed = true;
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
    let buildFailed = false;
    try {
      console.log('this is build');

      const bundle = await rollup({
        input: 'src/index.js',
        plugins: [
          babel({ babelHelpers: 'bundled', presets: ['@babel/preset-react'] }),
          resolve(),
          commonjs(),
        ],
        external: ['react'],
      });

      await bundle.write({
        file: 'dist/cjs/bundle.js',
        format: 'cjs',
      });
      await bundle.write({
        file: 'dist/es/bundle.js',
        format: 'es',
      });
    } catch (error) {
      console.log('error', error);
      buildFailed = true;
    } finally {
      process.exit(buildFailed ? 1 : 0);
    }
  });

program.parse(process.argv);
