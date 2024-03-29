import fs from 'fs-extra';
import { rollup } from 'rollup';
import chalk from 'chalk';
import { createRollupConfig } from '../rollup/rollupConfig';
import { logBuildError, logBuildWarnings, clearConsole } from '../utils';
import { paths } from '../paths';

export async function build() {
  // node env is used by tools like browserslist, babel, etc.
  process.env.NODE_ENV = 'production';
  process.env.BABEL_ENV = 'production';

  let buildFailed = false;
  let hasWarnings = false;

  try {
    clearConsole();
    console.log(chalk.cyan('Creating an optimized build...'));

    let customConfig = {};
    if (fs.existsSync(paths.packageConfig)) {
      customConfig = require(paths.packageConfig);
    }

    if (customConfig.outDir) {
      fs.emptyDirSync(customConfig.outDir);
    } else {
      fs.emptyDirSync(paths.packageDist);
    }

    const rollupBuilds = createRollupConfig(customConfig);

    await Promise.all(
      rollupBuilds.map(async (buildConfig, idx) => {
        const bundle = await rollup({
          ...buildConfig,
          onwarn: (warning, warn) => {
            // log warnings only for the first bundle (prevents duplicate warnings)
            if (idx !== 0) return;

            // print this message only when there are no previous warnings for this build
            if (!hasWarnings) {
              console.log(chalk.yellow('Compiled with warnings.'));
            }
            hasWarnings = true;
            logBuildWarnings(warning, warn);
          },
        });
        await bundle.write(buildConfig.output);
        await bundle.close();
      })
    );

    console.log(chalk.green('Build succeeded!'));
  } catch (error) {
    buildFailed = true;
    clearConsole();
    console.error(chalk.red('Failed to compile.'));
    logBuildError(error);
  } finally {
    process.exit(buildFailed ? 1 : 0);
  }
}
