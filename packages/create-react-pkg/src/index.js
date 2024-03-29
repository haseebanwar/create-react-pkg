#!/usr/bin/env node

import path from 'path';
import semver from 'semver';
import fs from 'fs-extra';
import { program } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import validatePackageName from 'validate-npm-package-name';
import {
  checkForLatestVersion,
  getAuthorName,
  composePackageJSON,
  isUsingYarn,
  makePackageDeps,
  makeInstallArgs,
  getTemplateName,
  sanitizePackageName,
  executeInstallCommand,
  getNPMVersion,
  setLegacyPeerDeps,
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
            message: 'What is your package named?',
            initial: 'my-package',
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

      // check if user is on non-supported node version
      const currentNodeVersion = process.versions.node;
      const packageNodeVersion = packageJSON.engines.node;
      if (!semver.satisfies(currentNodeVersion, packageNodeVersion)) {
        console.error(
          `You are running Node ${currentNodeVersion}.\nCreate React Package requires Node ${
            semver.minVersion(packageNodeVersion).version
          } or higher.\nPlease update your version of Node.`
        );
        process.exit(1);
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

      // throw an error if package folder contains files except valid files
      const validFiles = [
        '.DS_Store',
        '.git',
        '.gitattributes',
        '.gitignore',
        '.gitlab-ci.yml',
        '.hg',
        '.hgcheck',
        '.hgignore',
        '.idea',
        '.npmignore',
        '.travis.yml',
        'docs',
        'mkdocs.yml',
        'Thumbs.db',
      ];
      const files = fs
        .readdirSync(projectPath)
        .filter((file) => !validFiles.includes(file));
      if (files.length) {
        console.error(
          chalk.red(
            `Please make sure that your package directory ${chalk.cyan(
              `"${packageName}"`
            )} is empty.\nRemove any hidden directories/files as well.`
          )
        );
        process.exit(1);
      }

      // check if user is creating a new package with an old version of CLI
      try {
        const latestVersionOfCLI = await checkForLatestVersion();

        if (
          latestVersionOfCLI &&
          semver.lt(packageJSON.version, latestVersionOfCLI)
        ) {
          console.error(
            chalk.red(
              `You are running \`create-react-pkg\` ${chalk.cyan(
                packageJSON.version
              )} which is behind the latest release ${chalk.cyan(
                latestVersionOfCLI
              )}`
            )
          );
          console.log(
            '\nPlease remove any global installs with one of the following commands:\n' +
              `- npm uninstall -g ${packageJSON.name}\n` +
              `- yarn global remove ${packageJSON.name}`
          );
          console.log(
            '\nThe latest instructions for creating a new package can be found here:\n' +
              'https://github.com/haseebanwar/create-react-pkg#getting-started'
          );
          process.exit(1);
        }
      } catch (error) {
        // ignore and let user continue with old version
      }

      // start creation of package
      console.log(
        `\nCreating a new package ${chalk.green(packageName)} in ${chalk.green(
          projectPath
        )}`
      );

      const template = getTemplateName(typescript, storybook);

      // copy the template
      await fs.copy(
        path.resolve(__dirname, `../templates/${template}`),
        projectPath
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
      const packageManager = useYarn ? 'yarn' : 'npm';

      // if user is setting up storybook with npm v7+, use legacy peer deps until storybook 7 is released
      // more https://github.com/storybookjs/storybook/issues/18298#issuecomment-1136158953
      let useLegacyPeerDeps = false;
      let setNPMRCForLegacyPeerDeps = false;
      if (packageManager === 'npm' && storybook) {
        const npmVersion = getNPMVersion();

        if (semver.gte(npmVersion, '7.0.0')) {
          // use legacy peer deps (for this install) even if user says no to the prompt below
          useLegacyPeerDeps = true;

          console.log(
            `\nWe've detected you are running npm version ${chalk.cyan(
              npmVersion
            )} which has peer dependency semantics which Storybook is incompatible with.`
          );
          console.log(
            `In order to work with Storybook's package structure, you'll need to run \`npm\` with the \`--legacy-peer-deps=true\` flag`
          );
          console.log(
            `\nMore info: ${chalk.yellow(
              'https://github.com/storybookjs/storybook/issues/18298'
            )}\n`
          );

          const legacyPeerDepsInput = await prompts({
            type: 'confirm',
            name: 'setNPMRCForLegacyPeerDeps',
            message: `Generate an \`.npmrc\` to run \`npm\` with the \`--legacy-peer-deps=true\` flag?`,
            initial: true,
          });

          setNPMRCForLegacyPeerDeps =
            legacyPeerDepsInput.setNPMRCForLegacyPeerDeps;
        }
      }

      console.log(
        '\nInstalling dependencies. This might take a couple of minutes.'
      );
      console.log(
        `Installing ${chalk.cyan('react')}, ${chalk.cyan(
          'react-dom'
        )}, and ${chalk.cyan('react-pkg-scripts')}${
          typescript || storybook ? ' with' : ''
        }`
      );
      typescript && console.log(`- ${chalk.cyan('typescript')}`);
      storybook && console.log(`- ${chalk.cyan('storybook')}`);
      useYarn && console.log(''); // line break for yarn only

      // install deps
      const dependencies = makePackageDeps(typescript, storybook);
      process.chdir(projectPath);

      if (setNPMRCForLegacyPeerDeps) {
        setLegacyPeerDeps();
      }

      const installArgs = makeInstallArgs(
        packageManager,
        dependencies,
        useLegacyPeerDeps
      );
      await executeInstallCommand(packageManager, installArgs);

      console.log('\nInstalled dependencies');

      console.log(`\nSuccess! Created ${packageName} at ${projectPath}`);
      console.log(
        'Inside that directory, you can run the following commands:\n'
      );

      console.log(chalk.cyan(`  ${packageManager} start`));
      console.log('    Watches for changes as you build.\n');

      console.log(
        chalk.cyan(
          `  ${packageManager}${packageManager === 'npm' ? ' run' : ''} build`
        )
      );
      console.log('    Creates an optimized production build.\n');

      console.log(chalk.cyan(`  ${packageManager} test`));
      console.log('    Runs tests with Jest.\n');

      console.log('Build Something Great!');

      process.exit(0);
    } catch (error) {
      console.error(chalk.red(`Failed to create package: ${error.message}`));
      console.log('error', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
