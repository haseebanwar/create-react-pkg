import { execSync } from 'child_process';
import {
  basePackageJSON,
  dependencies,
  tsDependencies,
  storybookDependencies,
} from './pkgTemplate';

export function getAuthorName() {
  let author = '';

  author = execSync('npm config get init-author-name').toString().trim();
  if (author) return author;

  author = execSync('git config --global user.name').toString().trim();
  if (author) return author;

  return author;
}

// taken from TSDX
export function safePackageName(packageName) {
  return packageName
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');
}

export function composePackageJSON(
  packageName,
  authorName,
  useTypescript,
  useStorybook
) {
  const safeName = safePackageName(packageName);
  return {
    name: packageName,
    author: authorName,
    main: `dist/index.js`, // CJS entry
    module: `dist/esm/${safeName}.js`, // ES entry
    ...(useTypescript && {
      types: './dist/types/index.d.ts',
    }),
    // spreading after so name fields appear above base fields in created package
    ...basePackageJSON,
    ...(useStorybook && {
      scripts: {
        ...basePackageJSON.scripts,
        storybook: 'start-storybook -p 6006',
        'build-storybook': 'build-storybook',
      },
    }),
  };
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

export function makePackageDeps(useTypescript, useStorybook) {
  const deps = [...dependencies];
  if (useTypescript) {
    deps.push(...tsDependencies);
  }
  if (useStorybook) {
    deps.push(...storybookDependencies);
  }

  return deps;
}

export function makeInstallCommand(cmd, dependencies) {
  switch (cmd) {
    case 'npm':
      return `npm install --save-dev ${dependencies.join(' ')}`;
    case 'yarn':
      return `yarn add ${dependencies.join(' ')} --dev`;
    default:
      throw new Error('Invalid package manager');
  }
}
