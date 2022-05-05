import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import camelCase from 'camelcase';
import eslint from './rollupESLintPlugin';
import { eslintFormatter } from '../eslint/eslintFormatter';
import { checkTypescriptSetup, sanitizePackageName } from '../utils';
import { paths } from '../paths';

const buildModules = [
  {
    format: 'cjs',
    mode: 'development',
  },
  {
    format: 'cjs',
    mode: 'production',
  },
  {
    format: 'esm',
  },
  {
    format: 'umd',
    mode: 'development',
  },
  {
    format: 'umd',
    mode: 'production',
  },
];

export function createRollupConfig(options) {
  const { packagePeerDeps, packageName } = options;
  const useTypescript = checkTypescriptSetup();
  const safePackageName = sanitizePackageName(packageName);

  return buildModules.map((buildModule, idx) => {
    const { format, mode } = buildModule;

    let output = {
      dir: `${paths.packageDist}`,
      format,
      sourcemap: true,
      freeze: false, // do not call Object.freeze on imported objects with import * syntax
      exports: 'named',
      assetFileNames: '[name][extname]',
      ...(format === 'umd' && {
        name: camelCase(safePackageName),
        // inline dynamic imports for umd modules
        // because rollup doesn't support code-splitting for IIFE/UMD
        inlineDynamicImports: true,
        // tell rollup that external module like 'react' should be named this in IIFE/UMD
        // for example 'react' will be bound to the window object (in browser) like
        // window.React = // react
        globals: { react: 'React', 'react-native': 'ReactNative' },
      }),
    };

    switch (mode) {
      case 'production': {
        output = {
          ...output,
          entryFileNames: `${format}/${safePackageName}.min.js`,
          chunkFileNames: `${format}/[name]-[hash].min.js`,
        };
        break;
      }
      default: {
        output = {
          ...output,
          entryFileNames: `${format}/${safePackageName}.js`,
          chunkFileNames: `${format}/[name]-[hash].js`,
        };
        break;
      }
    }

    return {
      input: `src/index.${useTypescript ? 'tsx' : 'js'}`,
      plugins: [
        resolve(),
        commonjs({ include: /node_modules/ }),
        json(),
        useTypescript &&
          typescript({
            tsconfig: paths.packageTSConfig,
            tsconfigDefaults: {
              exclude: [
                // all test files
                '**/*.spec.ts',
                '**/*.test.ts',
                '**/*.spec.tsx',
                '**/*.test.tsx',
                '**/*.spec.js',
                '**/*.test.js',
                '**/*.spec.jsx',
                '**/*.test.jsx',
                // '**/*.+(spec|test).{ts,tsx,js,jsx}',
                // TS defaults below
                'node_modules',
                'bower_components',
                'jspm_packages',
                'dist', // outDir is default
              ],
            },
            // write declaration files only once (not again and again for all build formats)
            useTsconfigDeclarationDir: idx === 0,
            ...(idx !== 0 && {
              tsconfigOverride: {
                compilerOptions: {
                  declaration: false,
                },
              },
            }),
          }),
        !useTypescript &&
          babel({
            exclude: 'node_modules/**',
            babelHelpers: 'bundled',
            presets: [
              [require.resolve('@babel/preset-env')],
              [require.resolve('@babel/preset-react')],
            ],
            babelrc: false,
          }),
        // plugins that should run only once for all types of bundles
        idx === 0 && [
          eslint({
            formatter: eslintFormatter,
          }),
          postcss({
            extract: `css/${safePackageName}.css`,
            minimize: true,
            plugins: [autoprefixer()],
            sourceMap: true,
            config: false, // do not load postcss config
            // css modules are by default supported for .module.css, .module.scss, etc
          }),
        ],
        mode &&
          replace({
            'process.env.NODE_ENV': JSON.stringify(mode),
            preventAssignment: true,
          }),
        mode === 'production' && terser(),
      ]
        .flat()
        .filter(Boolean),
      // don't include package peer deps in the bundled code
      external: [...Object.keys(packagePeerDeps || [])],
      output,
    };
  });
}
