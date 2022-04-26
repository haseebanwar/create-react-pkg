import fs from 'fs-extra';
import { rollup } from 'rollup';
import chalk from 'chalk';
import { createRollupConfig } from '../rollup/rollupConfig';
import {
  writeCjsEntryFile,
  logBuildError,
  logBuildWarnings,
  // clearConsole,
} from '../utils';
import { paths } from '../paths';

export async function build() {
  console.log('THIS IS BUILD!');

  // node env is used by many tools like browserslist
  process.env.NODE_ENV = 'production';
  process.env.BABEL_ENV = 'production';

  let bundle;
  let buildFailed = false;
  let hasWarnings = false;

  try {
    // clearConsole();
    console.log(chalk.cyan('Creating an optimized build...'));

    fs.emptyDirSync(paths.packageDist);

    const packagePackageJson = fs.readJSONSync(paths.packagePackageJson);

    const rollupConfig = createRollupConfig({
      packageName: packagePackageJson.name,
      packagePeerDeps: packagePackageJson.peerDependencies,
    });

    bundle = await rollup({
      ...rollupConfig,
      onwarn: (warning, warn) => {
        // print this message only when there are no previous warnings for this build
        if (!hasWarnings) {
          console.log(chalk.yellow('Compiled with warnings.'));
        }
        hasWarnings = true;
        logBuildWarnings(warning, warn);
      },
    });

    writeCjsEntryFile(packagePackageJson.name);

    for (const output of rollupConfig.output) {
      await bundle.write(output);
    }

    console.log(chalk.green('Build succeeded!'));
  } catch (error) {
    buildFailed = true;
    // clearConsole();
    console.error(chalk.red('Failed to compile.'));
    logBuildError(error);
  } finally {
    if (bundle) {
      await bundle.close();
    }
    process.exit(buildFailed ? 1 : 0);
  }
}
