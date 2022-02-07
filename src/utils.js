import { execSync } from 'child_process';
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
