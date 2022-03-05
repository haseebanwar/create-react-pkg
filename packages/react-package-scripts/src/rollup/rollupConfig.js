import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import babelPresetReact from '@babel/preset-react';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import eslintFormatter from 'react-dev-utils/eslintFormatter';
import camelCase from 'camelcase';
import eslint from './rollupESLintPlugin';
import { sanitizePackageName } from '../utils';
import { paths } from '../paths';

const buildModules = ['cjs', 'esm', 'umd'];

export function createRollupConfig(options) {
  const { packageName, useTypescript, packagePeerDeps } = options;
  const safePackageName = sanitizePackageName(packageName);

  const config = {
    input: `src/index.${useTypescript ? 'tsx' : 'js'}`,
    plugins: [
      eslint({
        formatter: eslintFormatter,
      }),
      resolve(),
      commonjs({ include: /node_modules/ }),
      json(),
      useTypescript &&
        typescript({
          tsconfig: paths.tsconfigJson,
          useTsconfigDeclarationDir: true,
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
        }),
      !useTypescript &&
        babel({
          exclude: 'node_modules/**',
          babelHelpers: 'bundled',
          presets: [babelPresetReact], // TODO: replace with require.resolve
          babelrc: false,
        }),
      postcss({
        extract: `css/${safePackageName}.css`,
        minimize: true,
        plugins: [autoprefixer()],
        sourceMap: true,
        config: false, // do not load postcss config
        // css modules are by default supported for .module.css, .module.scss, etc
      }),
    ].filter(Boolean),
    external: [...Object.keys(packagePeerDeps || [])],
  };

  const output = buildModules
    .map((buildModule) => {
      const baseOutput = {
        dir: `${paths.appDist}`,
        format: buildModule,
        sourcemap: true,
        freeze: false, // do not call Object.freeze on imported objects with import * syntax
        exports: 'named',
        entryFileNames: `${buildModule}/${safePackageName}.js`,
        chunkFileNames: `${buildModule}/[name]-[hash].js`,
        assetFileNames: '[name][extname]',
      };

      switch (buildModule) {
        case 'esm':
          return {
            ...baseOutput,
            entryFileNames: `${buildModule}/${safePackageName}.js`,
          };
        case 'cjs':
          return [
            {
              ...baseOutput,
            },
            {
              ...baseOutput,
              entryFileNames: `${buildModule}/${safePackageName}.min.js`,
              chunkFileNames: `${buildModule}/[name]-[hash].min.js`,
              plugins: [terser()],
            },
          ];
        case 'umd': {
          const baseUMDOutput = {
            ...baseOutput,
            name: camelCase(safePackageName),
            // inline dynamic imports for umd modules
            // because rollup doesn't support code-splitting for IIFE/UMD
            inlineDynamicImports: true,
            // tell rollup that external module like 'react' should be named this in IIFE/UMD
            // for example 'react' will be bound to the window object (in browser) like
            // window.React = // react
            globals: { react: 'React' },
          };

          return [
            {
              ...baseUMDOutput,
            },
            {
              ...baseUMDOutput,
              entryFileNames: `${buildModule}/${safePackageName}.min.js`,
              plugins: [terser()],
            },
          ];
        }
      }
    })
    .filter(Boolean)
    .flat();

  config.output = output;
  return config;
}

// a dirty workaround until this is fixed
// https://github.com/rollup/rollup/issues/4415
export function createRollupConfig2(options) {
  const { useTypescript, packagePeerDeps, packageName } = options;
  const safePackageName = sanitizePackageName(packageName);

  const baseConfig = {
    input: `src/index.${useTypescript ? 'tsx' : 'js'}`,
    plugins: [
      resolve(),
      commonjs({ include: /node_modules/ }),
      json(),
      useTypescript &&
        typescript({
          tsconfig: paths.tsconfigJson,
          useTsconfigDeclarationDir: true,
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
        }),
      !useTypescript &&
        babel({
          exclude: 'node_modules/**',
          babelHelpers: 'bundled',
          presets: [babelPresetReact], // TODO: replace with require.resolve
          babelrc: false,
        }),
      postcss({
        extract: `css/${safePackageName}.css`,
        minimize: true,
        plugins: [autoprefixer()],
        sourceMap: true,
        config: false, // do not load postcss config
        // css modules are by default supported for .module.css, .module.scss, etc
      }),
    ].filter(Boolean),
    external: [...Object.keys(packagePeerDeps || [])],
  };

  return buildModules
    .map((buildModule) => {
      const baseOutput = {
        dir: `${paths.appDist}`,
        format: buildModule,
        sourcemap: true,
        freeze: false, // do not call Object.freeze on imported objects with import * syntax
        exports: 'named',
        entryFileNames: `${buildModule}/${safePackageName}.js`,
        chunkFileNames: `${buildModule}/[name]-[hash].js`,
        assetFileNames: '[name][extname]',
      };

      switch (buildModule) {
        case 'esm': {
          return {
            ...baseConfig,
            plugins: [
              eslint({
                formatter: eslintFormatter,
              }),
              ...baseConfig.plugins,
            ],
            output: {
              ...baseOutput,
            },
          };
        }
        case 'cjs': {
          return [
            {
              ...baseConfig,
              output: {
                ...baseOutput,
              },
            },
            {
              ...baseConfig,
              plugins: [...baseConfig.plugins, terser()],
              output: {
                ...baseOutput,
                entryFileNames: `${buildModule}/${safePackageName}.min.js`,
                chunkFileNames: `${buildModule}/[name]-[hash].min.js`,
              },
            },
          ];
        }
        case 'umd': {
          const baseUMDOutput = {
            ...baseOutput,
            name: camelCase(safePackageName),
            // inline dynamic imports for umd modules
            // because rollup doesn't support code-splitting for IIFE/UMD
            inlineDynamicImports: true,
            // tell rollup that external module like 'react' should be named this in IIFE/UMD
            // for example 'react' will be bound to the window object (in browser) like
            // window.React = // react
            globals: { react: 'React' },
          };
          return [
            {
              ...baseConfig,
              output: {
                ...baseUMDOutput,
              },
            },
            {
              ...baseConfig,
              plugins: [...baseConfig.plugins, terser()],
              output: {
                ...baseUMDOutput,
                entryFileNames: `${buildModule}/${safePackageName}.min.js`,
              },
            },
          ];
        }
      }
    })
    .flat()
    .filter(Boolean);
}
