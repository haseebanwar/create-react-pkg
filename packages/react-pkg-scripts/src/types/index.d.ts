import { RollupOptions } from 'rollup';
import { RollupServeOptions } from 'rollup-plugin-serve';
import { RollupLivereloadOptions } from 'rollup-plugin-livereload';

type RollupOptionsResolver = (
  config: Omit<RollupOptions, 'onwarn'>,
  options: {
    format: 'esm' | 'cjs' | 'umd';
    mode: 'development' | 'production';
  }
) => RollupOptions;

type RollupPlaygroundOptionsResolver = (
  config: Omit<RollupOptions, 'onwarn'>
) => RollupOptions;

export declare interface UserConfig {
  /**
   * Entry point
   * @default 'src/index'
   */
  input?: string;
  /**
   * Directory relative from root where build output will be placed. If the
   * directory exists, it will be removed before the build.
   * @default 'dist'
   */
  outDir?: string;
  /**
   * Bundle formats
   * @default ['cjs','esm']
   */
  formats?: ['esm' | 'cjs' | 'umd'];
  /**
   * Name to expose in the UMD build. Use this option when you are using `umd` as one of the build formats.
   * @default 'camel-cased version of your package name'
   */
  name?: string;
  /**
   * Disable code linting with ESLint.
   * @default false
   */
  disableESLint?: boolean;
  /**
   * How Babel helpers are inserted into the Rollup bundle.
   * @default 'bundled'
   */
  babelHelpers?: 'runtime' | 'bundled';
  /**
   * Directly customize the underlying Rollup bundle. These options will be merged with Create React Package's internal Rollup options.
   * https://rollupjs.org/guide/en/#big-list-of-options
   */
  rollupOptions?: Omit<RollupOptions, 'onwarn'> | RollupOptionsResolver;
  /**
   * Integrated playground configuration
   */
  playground: {
    /**
     * Development server configuration
     * https://github.com/thgh/rollup-plugin-serve#options
     */
    server: RollupServeOptions;
    /**
     * Configure development server livereload
     * https://github.com/thgh/rollup-plugin-livereload#options
     */
    livereload: RollupLivereloadOptions;
    /**
     * Customize Rollup playground app bundle
     * https://rollupjs.org/guide/en/#big-list-of-options
     */
    rollupOptions?:
      | Omit<RollupOptions, 'onwarn'>
      | RollupPlaygroundOptionsResolver;
  };
}

/**
 * Type helper to make it easier to use crp.config.js
 * accepts a direct {@link UserConfig} object
 */
export declare function defineConfig(config: UserConfig): UserConfig;
