#!/usr/bin/env node

import path from 'path';
import { sync as spawnSync } from 'cross-spawn';
import fs from 'fs-extra';
import { program } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';
import {
  getAuthorName,
  composePackageJSON,
  isUsingYarn,
  makePackageDeps,
  makeInstallArgs,
  getTemplateName,
  sanitizePackageName,
} from './utils';
import packageJSON from '../package.json';

program.name(packageJSON.name);
program.version(packageJSON.version);

program
  .argument('[package-directory]')
  .usage(`${chalk.green('<package-directory>')} [options]`)
  .option('--ts, --typescript', 'initialize a typescript package')
  .option('--sb, --storybook', 'add storybook')
  .action(async (projectDirectory, flags) => {
    try {
      // prompt if package directory is not specified
      if (!projectDirectory) {
        const projectDirectoryInput = await prompts(
          {
            type: 'text',
            name: 'projectDirectory',
            initial: 'my-package',
            message: 'What is your package named?',
          },
          {
            onCancel: () => {
              console.log('Please specify the package directory');
              console.log(
                `  ${chalk.cyan(program.name())} ${chalk.green(
                  `<package-directory>`
                )}`
              );

              console.log('\nFor example:');
              console.log(
                `  ${chalk.cyan(program.name())} ${chalk.green(`my-package`)}`
              );

              console.log(
                `\nRun ${chalk.cyan(
                  `${program.name()} --help`
                )} to see all options.`
              );

              process.exit(1);
            },
          }
        );
        projectDirectory = projectDirectoryInput.projectDirectory;
      }

      const { storybook, typescript } = flags;

      const projectPath = path.resolve(projectDirectory);
      const packageName = sanitizePackageName(path.basename(projectPath));

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

      console.log(
        `\nCreating a new package ${chalk.green(packageName)} in ${chalk.green(
          projectPath
        )}`
      );

      const template = getTemplateName(typescript, storybook);

      // copy the template
      await fs.copy(
        path.resolve(__dirname, `../templates/${template}`),
        projectPath,
        {
          overwrite: true,
        }
      );

      // copy base files
      await fs.copy(
        path.resolve(__dirname, '../templates/baseFiles'),
        projectPath
      );

      // fix gitignore
      await fs.move(
        path.resolve(projectPath, './gitignore'),
        path.resolve(projectPath, './.gitignore')
      );

      // get author name
      let author = getAuthorName();

      // prompt to get author name if not present
      if (!author) {
        const authorInput = await prompts({
          type: 'text',
          name: 'author',
          message: 'Package author',
        });

        author = authorInput.author;
      }

      // fix license
      const licensePath = path.resolve(projectPath, 'LICENSE');
      let license = fs.readFileSync(licensePath, { encoding: 'utf-8' });

      license = license.replace(/\[year\]/g, new Date().getFullYear());
      license = license.replace(/\[author\]/g, author);
      fs.writeFileSync(licensePath, license, { encoding: 'utf-8' });

      // generate package.json
      const pkg = composePackageJSON(
        packageName,
        author,
        typescript,
        storybook
      );
      fs.outputJSONSync(path.resolve(projectPath, 'package.json'), pkg, {
        spaces: 2,
      });

      // decide whether to use npm or yarn for installing deps
      const useYarn = isUsingYarn();
      const packageCMD = useYarn ? 'yarn' : 'npm';

      console.log(
        '\nInstalling dependencies. This might take a couple of minutes.'
      );
      console.log(
        `Installing ${chalk.cyan('react')}, ${chalk.cyan(
          'react-dom'
        )}, and ${chalk.cyan('react-package-scripts')}${
          typescript || storybook ? ' with' : ''
        }`
      );
      typescript && console.log(`- ${chalk.cyan('typescript')}`);
      storybook && console.log(`- ${chalk.cyan('storybook')}`);
      useYarn && console.log(''); // line break for yarn only

      // install deps
      const dependencies = makePackageDeps(typescript, storybook);
      process.chdir(projectPath);
      const installArgs = makeInstallArgs(packageCMD, dependencies);
      spawnSync(packageCMD, installArgs, {
        stdio: 'inherit',
      });

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
      console.error(chalk.red('Failed to create package'));
      console.log('error', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
