import https from 'https';
import { execSync } from 'child_process';
import spawn from 'cross-spawn';
import {
  basePackageJSON,
  dependencies,
  tsDependencies,
  storybookDependencies,
  tsStorybookDependencies,
} from './pkgTemplate';
import packageJSON from '../package.json';

export function checkForLatestVersion() {
  return new Promise((resolve, reject) => {
    https
      .get(
        `https://registry.npmjs.org/-/package/${packageJSON.name}/dist-tags`,
        (res) => {
          if (res.statusCode === 200) {
            let body = '';
            res.on('data', (data) => (body += data));
            res.on('end', () => {
              resolve(JSON.parse(body).latest);
            });
          } else {
            reject(new Error('Failed to check for the latest version of CLI'));
          }
        }
      )
      .on('error', () => {
        reject(new Error('Failed to check for the latest version of CLI'));
      });
  });
}

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
      types: 'dist/types/index.d.ts',
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

export function getNPMVersion() {
  return execSync('npm --version').toString().trim();
}

export function setLegacyPeerDeps() {
  execSync('npm config set legacy-peer-deps=true --location=project');
}

// taken from create-react-app
// https://github.com/facebook/create-react-app/blob/main/packages/create-react-app/createReactApp.js
export function isUsingYarn() {
  return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0;
}

export function makePackageDeps(useTypescript, useStorybook) {
  const deps = [...dependencies];
  if (useTypescript) {
    deps.push(...tsDependencies);
  }
  if (useStorybook) {
    deps.push(...storybookDependencies);
    if (useTypescript) deps.push(...tsStorybookDependencies);
  }

  return deps;
}

export function makeInstallArgs(cmd, dependencies, useLegacyPeerDeps) {
  switch (cmd) {
    case 'npm':
      return [
        'install',
        ...dependencies,
        '--save-dev',
        '--no-audit', // https://github.com/facebook/create-react-app/issues/11174
        '--loglevel',
        'error',
        useLegacyPeerDeps ? '--legacy-peer-deps' : '',
      ].filter(Boolean);
    case 'yarn':
      return ['add', ...dependencies, '--dev'];
    default:
      throw new Error('Unkown package manager');
  }
}

export function executeInstallCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
    });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Error installing dependencies'));
        return;
      }
      resolve();
    });
  });
}
