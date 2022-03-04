import chalk from 'react-dev-utils/chalk';

export function writeCjsEntryFile(packageName) {
  const safeName = safePackageName(packageName);
  const contents = `'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/${safeName}.min.js');
} else {
  module.exports = require('./cjs/${safeName}.js');
}`;
  return fs.outputFileSync(path.join(paths.appDist, 'index.js'), contents);
}

// taken from TSDX
export function safePackageName(packageName) {
  return packageName
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');
}

export const resolvePath = function (relativePath) {
  return path.resolve(process.cwd(), relativePath);
};

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
