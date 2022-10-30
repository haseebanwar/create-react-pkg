import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { DEFAULT_EXTENSIONS as DEFAULT_BABEL_EXTENSIONS } from '@babel/core';
import { babel } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import html from '@rollup/plugin-html';
import serve from 'rollup-plugin-serve';
import live from 'rollup-plugin-livereload';
import autoprefixer from 'autoprefixer';
import camelCase from 'camelcase';
import eslint from './rollupESLintPlugin';
import { eslintFormatter } from '../eslint/eslintFormatter';
import {
  checkTypescriptSetup,
  sanitizePackageName,
  writeCjsEntryFile,
  readPackageJsonOfPackage,
} from '../utils';
import { paths } from '../paths';
import { generateHTML } from './rollupGenerateHtml';

const allBuildFormats = [
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
    mode: 'development',
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

export function createRollupConfig(customConfig) {
  const packagePackageJson = readPackageJsonOfPackage();
  const useTypescript = checkTypescriptSetup();
  const safePackageName = sanitizePackageName(packagePackageJson.name);

  const config = {
    outDir: paths.packageDist,
    input: `src/index.${useTypescript ? 'tsx' : 'js'}`,
    name: camelCase(safePackageName),
    formats: ['cjs', 'esm'],
    disableESLint: false,
    babelHelpers: 'bundled',
    ...customConfig,
  };
  const {
    input,
    outDir,
    formats,
    name,
    disableESLint,
    rollupOptions,
    babelHelpers,
  } = config;

  const buildFormats = allBuildFormats.filter((buildModule) =>
    formats.includes(buildModule.format)
  );

  if (buildFormats.find(({ format }) => format === 'cjs')) {
    writeCjsEntryFile(packagePackageJson.name, config.outDir);
  }

  return buildFormats.map((buildModule, idx) => {
    const { format, mode } = buildModule;
    // for UMD, always bundle babel helpers
    const babelHelpersExplicitUMD = format === 'umd' ? 'bundled' : babelHelpers;

    let output = {
      dir: outDir,
      format,
      sourcemap: true,
      freeze: false, // do not call Object.freeze on imported objects with import * syntax
      exports: 'named',
      assetFileNames: '[name][extname]',
      ...(format === 'umd' && {
        name,
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
      case 'development':
      default: {
        output = {
          ...output,
          entryFileNames: `${format}/${safePackageName}.js`,
          chunkFileNames: `${format}/[name]-[hash].js`,
        };
        break;
      }
    }

    const config = {
      input,
      // don't include package peer deps in the bundled code
      external: [
        ...Object.keys(packagePackageJson.peerDependencies || []),
        babelHelpersExplicitUMD === 'runtime' && /@babel\/runtime/,
      ].filter(Boolean),
      // allow user defined rollup root options
      ...(rollupOptions || {}),
      plugins: [
        idx === 0 &&
          disableESLint === false &&
          eslint({
            formatter: eslintFormatter,
          }),
        nodeResolve(),
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
        // babel plugins run before presets. Plugin ordering is first to last. Preset ordering is reversed (last to first).
        babel({
          exclude: ['node_modules/**'],
          extensions: [...DEFAULT_BABEL_EXTENSIONS, '.ts', '.tsx'],
          ...(!useTypescript && {
            presets: [
              [require.resolve('@babel/preset-env')],
              [require.resolve('@babel/preset-react')],
            ],
          }),
          babelHelpers: babelHelpersExplicitUMD,
          // replace reference of the babal helper functions to the @babel/runtime version
          // more: https://babeljs.io/docs/en/babel-runtime#why
          plugins: [
            babelHelpersExplicitUMD === 'runtime' &&
              '@babel/plugin-transform-runtime',
          ].filter(Boolean),
        }),
        postcss({
          extract: idx === 0 ? `css/${safePackageName}.min.css` : false, // extract css file only once
          inject: false,
          minimize: true,
          plugins: [autoprefixer()],
          sourceMap: true,
          config: false, // do not load postcss config
          // css modules are by default supported for .module.css, .module.scss, etc
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify(mode),
          preventAssignment: true,
        }),
        mode === 'production' && terser(),
        // push user defined rollup plugins
        rollupOptions?.plugins,
      ]
        .flat()
        .filter(Boolean),
      // allow user defined rollup options for output
      output: {
        ...output,
        ...(rollupOptions?.output || {}),
      },
    };

    if (typeof rollupOptions === 'function') {
      return rollupOptions(config, { format, mode });
    }

    return config;
  });
}

export function createRollupPlaygroundConfig() {
  const config = {
    input: paths.playgroundEntry,
    external: [],
    plugins: [
      // eslint({
      //   formatter: eslintFormatter,
      // }),
      nodeResolve(),
      commonjs({
        // todo
        include: [/node_modules/, 'dist/**'],
      }),
      json(),
      // babel plugins run before presets. Plugin ordering is first to last. Preset ordering is reversed (last to first).
      babel({
        exclude: ['node_modules/**'],
        extensions: [...DEFAULT_BABEL_EXTENSIONS, '.ts', '.tsx'],
        presets: [
          [require.resolve('@babel/preset-env')],
          [require.resolve('@babel/preset-react')],
        ],
        babelHelpers: 'bundled',
      }),
      postcss({
        extract: 'styles.css',
        inject: false,
        plugins: [autoprefixer()],
        sourceMap: true,
        config: false, // do not load postcss config
        // css modules are by default supported for .module.css, .module.scss, etc
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        preventAssignment: true,
      }),
      html({
        template: generateHTML,
      }),
      serve({
        open: true,
        contentBase: paths.playgroundDist,
      }),
      live(),
    ],
    output: {
      dir: paths.playgroundDist,
      format: 'esm',
      sourcemap: true,
      freeze: false, // do not call Object.freeze on imported objects with import * syntax
      assetFileNames: '[name][extname]',
      entryFileNames: `[name].js`,
      chunkFileNames: `[name]-[hash].js`,
    },
  };
  return config;
}
