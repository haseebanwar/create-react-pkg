import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { basePackageJSON } from './pkgTemplate';

export function getAuthorName() {
  let author = '';

  author = execSync('npm config get init-author-name').toString().trim();
  if (author) return author;

  author = execSync('git config --global user.name').toString().trim();
  if (author) return author;

  return author;
}

export function composePackageJSON(packageName, authorName) {
  return { ...basePackageJSON, name: packageName, author: authorName };
}

export function getPackageCMD(useNpm) {
  if (useNpm) return 'npm';

  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return 'yarn';
  } catch (error) {
    // yarn is not installed, use npm as fallback
    return 'npm';
  }
}

export function makeInstallCommand(cmd, dependencies) {
  switch (cmd) {
    case 'npm':
      return `npm install ${dependencies.join(' ')} --save-dev`;
    case 'yarn':
      return `yarn add ${dependencies.join(' ')} --dev`;
    default:
      throw new Error('Invalid package manager');
  }
}

export function logBuildError(error) {
  switch (error.plugin) {
    case 'eslint':
      console.error(error.lintErrors);
      return;
    default:
      console.error(
        chalk.red(
          `${error.plugin === 'rpt2' ? 'typescript' : error.plugin || ''} ${
            error.message
          }`
        )
      );

      if (error.frame) {
        console.log(error.frame);
      } else if (error.stack) {
        console.log(error.stack.replace(error.message, ''));
      }
      return;
  }
}

export function logBuildWarnings(warning, warn) {
  switch (warning.plugin) {
    case 'eslint': {
      const { lintWarnings } = warning;
      console.log(lintWarnings || warning);
      return;
    }
    case 'typescript':
    case 'rpt2': {
      const { loc, message } = warning;
      console.log(`\n${path.relative(process.cwd(), loc.file)}:`);
      console.log(
        ` ${chalk.bold(`Line ${loc.line}:${loc.column}:`)} ${message}`
      );
      return;
    }
    default:
      // Use default for everything else
      warn(warning);
      return;
  }
}
