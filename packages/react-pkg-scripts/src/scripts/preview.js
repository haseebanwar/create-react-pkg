import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { watch as rollupWatch } from 'rollup';
import { createRollupPlaygroundConfig } from '../rollup/rollupConfig';
import { logBuildError, logBuildWarnings, clearConsole } from '../utils';
import { paths } from '../paths';

export function preview() {
  try {
    // node env is used by tools like browserslist, babel, etc.
    process.env.NODE_ENV = 'development';
    process.env.BABEL_ENV = 'development';

    let hasErrors = false;
    let hasWarnings = false;

    fs.emptyDirSync(paths.playgroundDist);

    let customConfig = {};
    if (fs.existsSync(paths.packageConfig)) {
      customConfig = require(paths.packageConfig);
    }

    const { outDir = paths.packageDist } = customConfig;
    const packageDistPicomatch = `${path.basename(outDir)}/**`;

    const rollupPlaygroundBuild = createRollupPlaygroundConfig(
      customConfig,
      packageDistPicomatch
    );

    const watcher = rollupWatch({
      ...rollupPlaygroundBuild,
      onwarn: (warning, warn) => {
        // ignoring because eslint already picked them
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

        // print this message only when there were no previous warnings for this build
        if (!hasWarnings) {
          clearConsole();
          console.log(chalk.yellow('Compiled with warnings.'));
        }
        hasWarnings = true;

        logBuildWarnings(warning, warn);
      },
      watch: {
        include: ['playground/**', packageDistPicomatch],
        exclude: ['node_modules/**'],
      },
    });

    watcher.on('event', (evt) => {
      if (evt.result) {
        evt.result.close();
      }

      if (evt.code === 'START') {
        clearConsole();
        console.log(chalk.yellow(`Compiling playground...`));
      }

      if (evt.code === 'ERROR') {
        hasErrors = true;
        clearConsole();
        console.log(chalk.red(`Failed to compile.`));
        logBuildError(evt.error);
      }

      if (evt.code === 'END') {
        if (!hasErrors && !hasWarnings) {
          console.log(chalk.green('Compiled successfully!'));
        }

        // reset for the next round of build
        hasErrors = false;
        hasWarnings = false;
      }
    });
  } catch (error) {
    console.error(chalk.red(`Failed to build preview: ${error.message}`));
    console.error('error', error);
    process.exit(1);
  }
}
