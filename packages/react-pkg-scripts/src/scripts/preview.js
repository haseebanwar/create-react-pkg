import chalk from 'chalk';
import { watch as rollupWatch } from 'rollup';
import { createRollupPlaygroundConfig } from '../rollup/rollupConfig';
import {
  logBuildError,
  //  clearConsole
} from '../utils';

export function preview() {
  try {
    // node env is used by tools like browserslist, babel, etc.
    process.env.NODE_ENV = 'development';
    process.env.BABEL_ENV = 'development';

    let hasErrors = false;
    let hasWarnings = false;

    const rollupPlaygroundBuild = createRollupPlaygroundConfig();

    const watcher = rollupWatch({
      ...rollupPlaygroundBuild,
      watch: {
        exclude: ['node_modules/**'],
      },
    });

    watcher.on('event', (evt) => {
      if (evt.result) {
        evt.result.close();
      }

      if (evt.code === 'START') {
        // clearConsole();
        console.log(chalk.yellow(`Compiling playground...`));
      }

      if (evt.code === 'ERROR') {
        hasErrors = true;
        // clearConsole();
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
