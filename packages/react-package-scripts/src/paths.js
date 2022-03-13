import { resolvePath } from './utils';

// TODO: better names
export const paths = {
  appRoot: resolvePath('.'),
  appSrc: resolvePath('src'),
  appPackageJson: resolvePath('package.json'),
  appDist: resolvePath('dist'),
  tsconfigJson: resolvePath('tsconfig.json'),
};
