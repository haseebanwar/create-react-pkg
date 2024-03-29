import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { paths } from './paths';

export function writeCjsEntryFile(packageName, filepath) {
  const safePackageName = sanitizePackageName(packageName);
  const contents = `'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/${safePackageName}.min.js');
} else {
  module.exports = require('./cjs/${safePackageName}.js');
}`;
  return fs.outputFileSync(
    path.join(filepath || paths.packageDist, 'index.js'),
    contents
  );
}

export function resolvePath(relativePath) {
  return path.resolve(process.cwd(), relativePath);
}

export function checkTypescriptSetup() {
  return fs.existsSync(paths.packageTSConfig);
}

export function readPackageJsonOfPackage() {
  return fs.readJSONSync(paths.packagePackageJson);
}

export function sanitizePackageName(packageName) {
  return packageName
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-z]+)|[^\w.-])|([^a-z0-9]+$)/g, '');
}

function logError(error) {
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
}

export function logBuildError(error) {
  switch (error.plugin) {
    case 'eslint':
      // lintErrors are from custom eslint rollup plugin, already formatted
      if (error.lintErrors) console.error(error.lintErrors);
      else logError(error);
      return;
    default:
      logError(error);
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

// taken from react-dev-utils
// https://github.com/facebook/create-react-app/blob/main/packages/react-dev-utils/clearConsole.js
export function clearConsole() {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
  );
}
