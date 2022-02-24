import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { babel } from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import babelPresetReact from '@babel/preset-react';
import eslintFormatter from 'react-dev-utils/eslintFormatter';
import camelCase from 'camelcase';
import eslint from './rollupESLintPlugin';
import { safePackageName } from '../utils';
import { paths } from '../paths';
import { buildModules } from '../constants';

export function createRollupInputOptions(useTypescript, pkgPeerDeps) {
  return {
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
          tsconfig: './tsconfig.json',
          useTsconfigDeclarationDir: true,
        }),
      !useTypescript &&
        babel({
          babelHelpers: 'bundled',
          presets: [babelPresetReact], // TODO: replace with require.resolve
        }),
    ].filter(Boolean),
    external: [...Object.keys(pkgPeerDeps || [])],
  };
}

export function createRollupOutputs(packageName) {
  const safeName = safePackageName(packageName);

  return buildModules
    .map((buildModule) => {
      const baseOutput = {
        dir: `${paths.appDist}/${buildModule}`,
        format: buildModule,
        sourcemap: true,
        freeze: false, // do not call Object.freeze on imported objects with import * syntax
        exports: 'named',
      };

      switch (buildModule) {
        case 'esm':
          return {
            ...baseOutput,
            entryFileNames: `${safeName}.js`,
          };
        case 'cjs':
          return [
            {
              ...baseOutput,
              entryFileNames: `${safeName}.js`,
            },
            {
              ...baseOutput,
              entryFileNames: `${safeName}.min.js`,
              plugins: [terser({ format: { comments: false } })],
            },
          ];
        case 'umd': {
          const baseUMDOutput = {
            ...baseOutput,
            name: camelCase(safeName),
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
              entryFileNames: `${safeName}.js`,
            },
            {
              ...baseUMDOutput,
              entryFileNames: `${safeName}.min.js`,
              plugins: [terser({ format: { comments: false } })],
            },
          ];
        }
      }
    })
    .flat();
}
