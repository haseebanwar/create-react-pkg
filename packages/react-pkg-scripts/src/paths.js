import { resolvePath } from './utils';

export const paths = {
  packageRoot: resolvePath('.'),
  packagePackageJson: resolvePath('package.json'),
  packageDist: resolvePath('dist'),
  packageTSConfig: resolvePath('tsconfig.json'),
  packageConfig: resolvePath('crp.config.js'),
  playgroundEntry: resolvePath('playground/index.js'),
  playgroundHTML: resolvePath('playground/index.html'),
  playgroundDist: resolvePath('playground/build'),
};
