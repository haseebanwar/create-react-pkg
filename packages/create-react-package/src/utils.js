import { execSync } from 'child_process';
import {
  basePackageJSON,
  dependencies,
  tsDependencies,
  storybookDependencies,
} from './pkgTemplate';

export function getTemplateName(useTypescript, useStorybook) {
  if (useTypescript && useStorybook) {
    return 'typescript-storybook';
  } else if (useTypescript) {
    return 'typescript';
  } else if (useStorybook) {
    return 'basic-storybook';
  }

  return 'basic';
}

export function getAuthorName() {
  let author = '';

  author = execSync('npm config get init-author-name').toString().trim();
  if (author) return author;

  author = execSync('git config --global user.name').toString().trim();
  if (author) return author;

  return author;
}

export function sanitizePackageName(packageName) {
  return packageName
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-z]+)|[^\w.-])|([^a-z0-9]+$)/g, '');
}

export function composePackageJSON(
  packageName,
  authorName,
  useTypescript,
  useStorybook
) {
  const safePackageName = sanitizePackageName(packageName);
  return {
    name: packageName,
    author: authorName,
    main: `dist/index.js`, // CJS entry
    module: `dist/esm/${safePackageName}.js`, // ES entry
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

export function makeInstallArgs(cmd, dependencies) {
  switch (cmd) {
    case 'npm':
      return [
        'install',
        ...dependencies,
        '--save-dev',
        '--no-audit', // https://github.com/facebook/create-react-app/issues/11174
      ];
    case 'yarn':
      return ['add', ...dependencies, '--dev'];
    default:
      throw new Error('Unkown package manager');
  }
}
