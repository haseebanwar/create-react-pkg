import fs from 'fs-extra';
import chalk from 'chalk';
import { watch as rollupWatch } from 'rollup';
import { createRollupPlaygroundConfig } from '../rollup/rollupConfig';
import { logBuildError, clearConsole } from '../utils';
import { paths } from '../paths';

export function preview() {
  try {
    // node env is used by tools like browserslist, babel, etc.
    process.env.NODE_ENV = 'development';
    process.env.BABEL_ENV = 'development';

    let hasErrors = false;
    let hasWarnings = false;

    fs.emptyDirSync(paths.playgroundDist);

    // if esm is not in formats show error message

    const rollupPlaygroundBuild = createRollupPlaygroundConfig();

    const watcher = rollupWatch({
      ...rollupPlaygroundBuild,
      onwarn: (warning, warn) => {
        // log warnings only for the first bundle (prevents duplicate warnings)
        // if (idx !== 0) return;

        // print this message only when there were no previous warnings for this build
        // if (!hasWarnings) {
        //   clearConsole();
        //   console.log(chalk.yellow('Compiled with warnings.'));
        // }
        console.log('WARNING!');
        hasWarnings = true;

        warn(warning);

        // ignoring because eslint already picked them
        // if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

        // logBuildWarnings(warning, warn);
      },
      watch: {
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
          // clearConsole();
          console.log(chalk.green('Compiled successfully!'));
        }

        // reset for the next round of build
        hasErrors = false;
        hasWarnings = false;
      }
    });
  } catch (error) {
    console.error(chalk.red(`Failed to run in watch mode: ${error.message}`));
    console.error('error', error);
    process.exit(1);
  }
}
