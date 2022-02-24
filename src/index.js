#!/usr/bin/env node

import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { program } from 'commander';
import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';
import camelCase from 'camelcase';

import { rollup, watch } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import babelPresetReact from '@babel/preset-react';
import clearConsole from 'react-dev-utils/clearConsole';
import eslintFormatter from 'react-dev-utils/eslintFormatter';
import { run as jestRun } from 'jest';

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
import { templates, buildModules } from './constants';
import { dependencies } from './pkgTemplate';
import packageJSON from '../package.json';

program.name(packageJSON.name);
program.version(packageJSON.version);

function createRollupInputOptions(useTypescript, pkgPeerDeps) {
  return {
    input: `src/index.${useTypescript ? 'tsx' : 'js'}`,
    plugins: [
      eslint({
        formatter: eslintFormatter,
      }),
      resolve(),
      commonjs({ include: /node_modules/ }),
      json(),
      useTypescript &&
        typescript({
          tsconfig: './tsconfig.json',
          useTsconfigDeclarationDir: true,
        }),
      !useTypescript &&
        babel({
          babelHelpers: 'bundled',
          presets: [babelPresetReact], // TODO: replace with require.resolve
        }),
    ].filter(Boolean),
    external: [...Object.keys(pkgPeerDeps || [])],
  };
}

function createRollupOutputs(packageName) {
  const safeName = safePackageName(packageName);

  return buildModules
    .map((buildModule) => {
      const baseOutput = {
        dir: `${paths.appDist}/${buildModule}`,
        format: buildModule,
        sourcemap: true,
        freeze: false, // do not call Object.freeze on imported objects with import * syntax
        exports: 'named',
      };

      switch (buildModule) {
        case 'esm':
          return {
            ...baseOutput,
            entryFileNames: `${safeName}.js`,
          };
        case 'cjs':
          return [
            {
              ...baseOutput,
              entryFileNames: `${safeName}.js`,
            },
            {
              ...baseOutput,
              entryFileNames: `${safeName}.min.js`,
              plugins: [terser({ format: { comments: false } })],
            },
          ];
        case 'umd': {
          const baseUMDOutput = {
            ...baseOutput,
            name: camelCase(safeName),
            // inline dynamic imports for umd modules
            // because rollup doesn't support code-splitting for IIFE/UMD
            inlineDynamicImports: true,
            // tell rollup that external module like 'react' should be named this in IIFE/UMD
            // for example 'react' will be bound to the window object (in browser) like
            // window.React = // react
            globals: { react: 'React' },
          };

          return [
            {
              ...baseUMDOutput,
              entryFileNames: `${safeName}.js`,
            },
            {
              ...baseUMDOutput,
              entryFileNames: `${safeName}.min.js`,
              plugins: [terser({ format: { comments: false } })],
            },
          ];
        }
      }
    })
    .flat();
}

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
    let bundle;
    let buildFailed = false;
    let hasWarnings = false;

    try {
      clearConsole();
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
        writeCjsEntryFile(appPackage.name);
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

program
  .command('test')
  .description('Jest test runner')
  .allowUnknownOption()
  .action(async () => {
    process.env.BABEL_ENV = 'test'; // because we're using babel for transforming JSX
    process.env.NODE_ENV = 'test'; // jest sets this but to be sure

    const argv = process.argv.slice(2);

    const jestConfig = {
      testEnvironment: 'jsdom',
      transform: {
        '.(js|jsx)$': require.resolve('./babelTransform.js'),
      },
      // transformIgnorePatterns already includes node_modules
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'], // it is default, explicitly specifying
      collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
      testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
      rootDir: paths.appRoot,
    };

    argv.push('--config', JSON.stringify(jestConfig));

    jestRun(argv);
  });

program.parse(process.argv);
