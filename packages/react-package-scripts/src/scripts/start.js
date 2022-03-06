import fs from 'fs-extra';
import chalk from 'react-dev-utils/chalk';
import { watch } from 'rollup';
import clearConsole from 'react-dev-utils/clearConsole';
import { createRollupConfig2 } from '../rollup/rollupConfig';
import { writeCjsEntryFile, logBuildError, logBuildWarnings } from '../utils';
import { paths } from '../paths';

export function start() {
  // node env is used by many tools like browserslist
  process.env.NODE_ENV = 'development';
  process.env.BABEL_ENV = 'development';

  let hasErrors = false;
  let hasWarnings = false;

  const appPackage = fs.readJSONSync(paths.appPackageJson);
  const isTypescriptConfigured = fs.existsSync(paths.tsconfigJson);

  // const rollupConfig = createRollupConfig({
  //   useTypescript: isTypescriptConfigured,
  //   packagePeerDeps: appPackage.peerDependencies,
  //   packageName: appPackage.name,
  // });
  // const watcher = watch({
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
  const watcher = watch(
    rollupConfigs.map((config) => ({
      ...config,
      onwarn: (warning, warn) => {
        // print this message only when there were no previous warnings for this build
        if (!hasWarnings) {
          clearConsole();
          console.log(chalk.yellow('Compiled with warnings.'));
        }
        hasWarnings = true;
        logBuildWarnings(warning, warn);
      },
      watch: {
        silent: true,
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
}