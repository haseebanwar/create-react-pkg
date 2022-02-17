import { resolvePath } from './utils';

export const paths = {
  appRoot: resolvePath('.'),
  appSrc: resolvePath('src'),
  appPackageJson: resolvePath('package.json'),
  appDist: resolvePath('dist'),
  tsconfigJson: resolvePath('tsconfig.json'),
};
