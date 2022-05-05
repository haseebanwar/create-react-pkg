import chalk from 'chalk';
import { watch as rollupWatch } from 'rollup';
import { createRollupConfig } from '../rollup/rollupConfig';
import {
  writeCjsEntryFile,
  logBuildError,
  logBuildWarnings,
  clearConsole,
  readPackageJsonOfPackage,
} from '../utils';

export function watch() {
  try {
    // node env is used by many tools like browserslist
    process.env.NODE_ENV = 'development';
    process.env.BABEL_ENV = 'development';

    let hasErrors = false;
    let hasWarnings = false;

    const appPackage = readPackageJsonOfPackage();

    const rollupBuilds = createRollupConfig({
      packagePeerDeps: appPackage.peerDependencies,
      packageName: appPackage.name,
    });

    const watcher = rollupWatch(
      rollupBuilds.map((config, idx) => ({
        ...config,
        onwarn: (warning, warn) => {
          // log warnings only for the first bundle (prevents duplicate warnings)
          if (idx !== 0) return;

          // print this message only when there were no previous warnings for this build
          if (!hasWarnings) {
            clearConsole();
            console.log(chalk.yellow('Compiled with warnings.'));
          }
          hasWarnings = true;

          // ignoring because eslint already picked them
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

          logBuildWarnings(warning, warn);
        },
        watch: {
          include: ['src/**'],
          exclude: ['node_modules/**'],
        },
      }))
    );

    watcher.on('event', (evt) => {
      if (evt.result) {
        evt.result.close();
      }

      if (evt.code === 'START') {
        clearConsole();
        console.log(chalk.yellow(`Compiling...`));
        writeCjsEntryFile(appPackage.name);
      }

      if (evt.code === 'ERROR') {
        hasErrors = true;
        clearConsole();
        console.log(chalk.red(`Failed to compile.`));
        logBuildError(evt.error);
      }

      if (evt.code === 'END') {
        if (!hasErrors && !hasWarnings) {
          clearConsole();
          console.log(chalk.green('Compiled successfully!'));
          console.log('\nNote that the development build is not optimized.');
          console.log(
            `To create a production build, use ${chalk.cyan('npm run build')}.`
          );
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
