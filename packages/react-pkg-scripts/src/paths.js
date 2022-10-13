import { resolvePath } from './utils';

export const paths = {
  packageRoot: resolvePath('.'),
  packagePackageJson: resolvePath('package.json'),
  packageDist: resolvePath('dist'),
  packageTSConfig: resolvePath('tsconfig.json'),
  packageConfig: resolvePath('crp.config.js'),
  // playground paths already have "playground" folder in their paths from process.cwd()
  playgroundEntry: resolvePath('index.js'),
  playgroundHTML: resolvePath('index.html'),
  playgroundDist: resolvePath('build'),
};
