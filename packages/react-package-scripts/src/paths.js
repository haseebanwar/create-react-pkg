import { resolvePath } from './utils';

export const paths = {
  packageRoot: resolvePath('.'),
  packagePackageJson: resolvePath('package.json'),
  packageDist: resolvePath('dist'),
  packageTSConfig: resolvePath('tsconfig.json'),
  packageConfig: resolvePath('crp.config.js'),
};
