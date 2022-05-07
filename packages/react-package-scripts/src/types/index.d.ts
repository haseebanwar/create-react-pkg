import { RollupOptions } from 'rollup';

export declare interface UserConfig {
  /**
   * Entry point
   * @default 'src/index'
   */
  input?: string;
  /**
   * Directory relative from `root` where build output will be placed. If the
   * directory exists, it will be removed before the build.
   * @default 'dist'
   */
  outDir?: string;
  /**
   * Name to expose in the UMD build.
   * @default 'camel-cased version of your package name'
   */
  name?: string;
  /**
   * Bundle formats
   * @default ['cjs','esm']
   */
  formats?: ['esm' | 'cjs' | 'umd'];
  /**
   * Will be merged with internal rollup options.
   * https://rollupjs.org/guide/en/#big-list-of-options
   */
  rollupOptions?: Omit<RollupOptions, 'onwarn'>;
}

/**
 * Type helper to make it easier to use rps.config.js
 * accepts a direct {@link UserConfig} object
 */
export declare function defineConfig(config: UserConfig): UserConfig;
