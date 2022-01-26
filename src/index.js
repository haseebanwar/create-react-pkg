#!/usr/bin/env node

import path from 'path';
import { exec } from 'child_process';
import fs from 'fs-extra';
import { program } from 'commander';
import chalk from 'chalk';
// import { execa }  from 'execa';
import packageJSON from '../package.json';

program.version(packageJSON.version);

program
  .argument('<lib-name>', 'Library name')
  .description('Create a new JavaScript package')
  .action(async (libName) => {
    try {
      console.log('I am a test command');

      const template = 'basic';

      const libDirectory = libName === '.' ? 'test' : libName;
      const projectPath = path.resolve(process.cwd(), libDirectory);

      console.log(`Creating a new package in ${chalk.green(projectPath)}`);

      // TODO: check project folder

      if (fs.existsSync(projectPath)) {
        console.log(
          `Failed to create. A folder named ${chalk.bold.red(
            libDirectory
          )} already exists`
        );
        return;
      }

      await fs.mkdir(libDirectory);

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

      // author name

      // install deps
      console.log('Installing packages. This might take a couple of minutes.');
      // Installing react, react-dom, and react-scripts with cra-template...
      process.chdir(projectPath);

      exec('node -v', (error, stdout, stderr) => {
        if (error || stderr) {
          throw error || stderr;
        }

        console.log(`stdout: ${stdout}`);
      });
    } catch (error) {
      console.log('error', error);
    }
  });

program.parse(process.argv);
