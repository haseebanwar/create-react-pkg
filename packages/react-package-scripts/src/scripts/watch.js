import fs from 'fs-extra';
import chalk from 'chalk';
import { watch as rollupWatch } from 'rollup';
import { createRollupConfig2 } from '../rollup/rollupConfig';
import {
  writeCjsEntryFile,
  logBuildError,
  logBuildWarnings,
  clearConsole,
  checkTypescriptSetup,
} from '../utils';
import { paths } from '../paths';

export function watch() {
  try {
    // node env is used by many tools like browserslist
    process.env.NODE_ENV = 'development';
    process.env.BABEL_ENV = 'development';

    let hasErrors = false;
    let hasWarnings = false;

    const appPackage = fs.readJSONSync(paths.packagePackageJson);
    const isTypescriptConfigured = checkTypescriptSetup();

    // const rollupConfig = createRollupConfig({
    //   useTypescript: isTypescriptConfigured,
    //   packagePeerDeps: appPackage.peerDependencies,
    //   packageName: appPackage.name,
    // });
    // const watcher = rollupWatch({
    //   ...rollupConfig,
    //   watch: {
    //     silent: true,
    //     include: ['src/**'],
    //     exclude: ['node_modules/**'],
    //   },
    //   onwarn: (warning, warn) => {
    //     // clear console only if there were no previous warnings for this round of build
    //     if (!hasWarnings) {
    //       clearConsole();
    //       console.log(chalk.yellow('Compiled with warnings.'));
    //     }
    //     hasWarnings = true;
    //     logBuildWarnings(warning, warn);
    //   },
    // });

    // a dirty workaround until this is fixed
    // https://github.com/rollup/rollup/issues/4415
    const rollupConfigs = createRollupConfig2({
      useTypescript: isTypescriptConfigured,
      packagePeerDeps: appPackage.peerDependencies,
      packageName: appPackage.name,
    });
    const watcher = rollupWatch(
      rollupConfigs.map((config) => ({
        ...config,
        onwarn: (warning, warn) => {
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
