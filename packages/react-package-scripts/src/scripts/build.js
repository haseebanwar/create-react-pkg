import fs from 'fs-extra';
import { rollup } from 'rollup';
import chalk from 'chalk';
import { createRollupConfig } from '../rollup/rollupConfig';
import {
  writeCjsEntryFile,
  logBuildError,
  logBuildWarnings,
  clearConsole,
} from '../utils';
import { paths } from '../paths';

export async function build() {
  // node env is used by many tools like browserslist
  process.env.NODE_ENV = 'production';
  process.env.BABEL_ENV = 'production';

  let bundle;
  let buildFailed = false;
  let hasWarnings = false;

  try {
    clearConsole();
    console.log(chalk.cyan('Creating an optimized build...'));

    fs.emptyDirSync(paths.appDist);

    const appPackage = fs.readJSONSync(paths.appPackageJson);
    const isTypescriptConfigured = fs.existsSync(paths.tsconfigJson);

    const rollupConfig = createRollupConfig({
      useTypescript: isTypescriptConfigured,
      packageName: appPackage.name,
      packagePeerDeps: appPackage.peerDependencies,
    });

    bundle = await rollup({
      ...rollupConfig,
      onwarn: (warning, warn) => {
        // print this message only when there were no previous warnings for this build
        if (!hasWarnings) {
          console.log(chalk.yellow('Compiled with warnings.'));
        }
        hasWarnings = true;
        logBuildWarnings(warning, warn);
      },
    });

    writeCjsEntryFile(appPackage.name);

    for (const output of rollupConfig.output) {
      await bundle.write(output);
    }

    console.log(chalk.green('Build succeeded!'));
  } catch (error) {
    buildFailed = true;
    clearConsole();
    console.error(chalk.red('Failed to compile.'));
    logBuildError(error);
  } finally {
    if (bundle) {
      await bundle.close();
    }
    process.exit(buildFailed ? 1 : 0);
  }
}
