#!/usr/bin/env node

import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { program } from 'commander';
import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';
import {
  getAuthorName,
  composePackageJSON,
  getPackageCMD,
  makePackageDeps,
  makeInstallCommand,
} from './utils';
import packageJSON from '../package.json';

const templates = [
  'basic',
  'basic-storybook',
  'typescript',
  'typescript-storybook',
];

program.name(packageJSON.name);
program.version(packageJSON.version);

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
          chalk.red(
            'Invalid template, please use one of the following supported templates'
          )
        );

        // print valid templates
        templates.forEach((supportedTemplate) => {
          console.log(`- ${chalk.cyan(supportedTemplate)}`);
        });

        process.exit(1);
      }

      const useTypescript = template.includes('typescript');
      const useStorybook = template.includes('storybook');
      const projectPath = path.resolve(projectDirectory);
      const packageName = path.basename(projectPath);

      // validate package name
      const {
        validForNewPackages,
        errors: packageNameErrors,
        warnings: packageNameWarnings,
      } = validatePackageName(packageName);

      if (!validForNewPackages) {
        console.error(
          chalk.red(`Invalid package name ${chalk.cyan(`"${packageName}"`)}`)
        );

        [...(packageNameErrors || []), ...(packageNameWarnings || [])].forEach(
          (error) => {
            console.log(chalk.red(`  - ${error}`));
          }
        );
        console.log('\nPlease use a different package name');
        process.exit(1);
      }

      // create package directory if it doesn't exist
      fs.ensureDirSync(projectPath);

      // throw an error if package folder is not empty
      const files = fs.readdirSync(projectPath);
      if (files.length) {
        console.error(
          chalk.red(
            `Please make sure that your package directory ${chalk.cyan(
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
      const dependencies = makePackageDeps(useTypescript, useStorybook);
      console.log(
        '\nInstalling dependencies. This might take a couple of minutes.'
      );

      dependencies.forEach((dep) => console.log(`- ${chalk.cyan(dep)}`));
      process.chdir(projectPath);

      // generate package.json
      const pkg = composePackageJSON(
        packageName,
        author,
        useTypescript,
        useStorybook
      );
      fs.outputJSONSync(path.resolve(projectPath, 'package.json'), pkg, {
        spaces: 2,
      });

      // decide whether to use npm or yarn for installing deps
      const packageCMD = getPackageCMD(useNpm);
      const command = makeInstallCommand(packageCMD, dependencies);
      execSync(command, { stdio: 'ignore' });

      console.log('\nInstalled dependencies');

      console.log(`\nSuccess! Created ${packageName} at ${projectPath}`);
      console.log(
        'Inside that directory, you can run the following commands:\n'
      );

      console.log(chalk.cyan(`  ${packageCMD} start`));
      console.log('    Watches for changes as you build.\n');

      console.log(
        chalk.cyan(`  ${packageCMD}${packageCMD === 'npm' ? ' run' : ''} build`)
      );
      console.log('    Creates an optimized production build.\n');

      console.log(chalk.cyan(`  ${packageCMD} test`));
      console.log('    Runs tests with Jest.\n');

      console.log('Show the World what you can build!');

      process.exit(0);
    } catch (error) {
      console.log('error', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
