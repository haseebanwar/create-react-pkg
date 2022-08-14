# Create React Package

Create React packages with no build configuration.

## Quick Overview

```sh
npx create-react-package my-package
cd my-package
npm start
```

You don’t need to install or configure tools like Rollup, Babel, or ESLint. They are pre-configured and hidden so that you can focus on the code.

## Contents

- [Why](#why)
- [Getting Started](#getting-started)
  - [Choose Package Manager](#choose-package-manager)
    - [npm](#npm)
    - [yarn](#yarn)
  - [Options](#options)
  - [Available Scripts](#available-scripts)
    - [`npm start` or `yarn start`](#npm-start-or-yarn-start)
    - [`npm test` or `yarn test`](#npm-test-or-yarn-test)
    - [`npm run build` or `yarn build`](#npm-run-build-or-yarn-build)
- [Building your Package](#building-your-package)
  - [Install a Dependency](#install-a-dependency)
  - [Manage External Dependencies](#manage-external-dependencies)
  - [Preview](#preview)
  - [Build and Publish](#build-and-publish)
- [Philosophy](#philosophy)
- [Customization](#customization)
  - [Config Intellisense](#config-intellisense)
  - [Config Options](#config-options)
    - [input](#input)
    - [outDir](#outdir)
    - [formats](#formats)
    - [name](#name)
    - [disableESLint](#disableeslint)
    - [rollupOptions](#rollupoptions)
  - [Rollup](#rollup)
    - [Example: Import images](#example-import-images)
  - [Babel](#babel)
    - [Example: Optimize Lodash](#example-optimize-lodash)
  - [ESLint](#eslint)
  - [Jest](#jest)
    - [CLI Options](#cli-options)
- [Styling](#styling)
  - [Sass/Stylus/Less Files](#sassstylusless-files)
  - [Post-Processing CSS](#post-processing-css)
- [Advanced Usage](#advanced-usage)
  - [Code Splitting](#code-splitting)
  - [Configure Supported Browsers](#configure-supported-browsers)
- [Author](#author)
- [License](#license)

## Why

- Get started in seconds, easy to maintain, just one dependency
- CJS, ESM, and UMD modules support
- Pre-configured Rollup, Babel, Jest, and ESLint
- Completely customizable
- Tree-shaking
- Code-splitting
- Dev/Production builds
- Typescript support
- Storybook support
- Compile-time linting with ESLint
- Out-of-the-box support for CSS, SASS, and JSON files
- Pre-configured Browserslist, Sourcemaps, and Minification
- VSCode friendly errors

## Getting Started

### Choose Package Manager

**You’ll need to have Node 14.17.0 or a later version on your local development machine**. It is recommended to use the latest LTS version. You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to switch Node versions between different projects.

To create a new package, you may choose one of the following methods:

#### npm

```sh
npx create-react-package my-package
```

or

```sh
npm init react-package my-package
```

#### yarn

```sh
yarn create react-package my-package
```

### Options

`create-react-package` comes with the following options:

- **--ts, --typescript**: Initialize a TypeScript project.
- **--sb, --storybook**: Add storybook support.

### Available Scripts

Inside the newly created project, you can run some built-in commands:

#### `npm start` or `yarn start`

Runs the project in development mode, watches for file changes, and rebuilds on change. The build errors and lint warnings are printed in the console as you go.

<p align='center'>
<img src='https://res.cloudinary.com/https-haseebanwar-net/image/upload/v1659168243/create-react-package/npm-start_qjwfv2.gif' width='600' alt='npm start'>
</p>

#### `npm test` or `yarn test`

Runs your tests with Jest test runner.

#### `npm run build` or `yarn build`

Creates an optimized production build of your package in CommonJS, ES, and UMD module formats.

## Building your Package

### Install a Dependency

The generated project includes `react` and `react-dom` along with the scripts used by Create React Package as development dependencies.

You may install other dependencies, for example, Material UI:

```sh
npm i -D @mui/material
```

Since you are building a library, you probably need to install Material UI or other related frameworks as dev dependencies. It is the responsibility of the app consuming your library to have these dependencies installed.

It is important that you define such dependencies as external dependencies.

### Manage External Dependencies

External dependencies are those that should not be included in the bundled code of your library and should be installed by the consumer of the library.

To specify external dependencies, add them to `peerDependencies` key in your package.json

```json
"peerDependencies": {
  "react": ">=17",
  "react-dom": ">=17",
  "@mui/material": "^5.9.2"
},
```

Create React package already specifies `react` and `react-dom` as peer dependencies.

### Preview

To preview and test your library before publishing, you can use:

- [Storybook](https://storybook.js.org/)
- [npm-link](https://docs.npmjs.com/cli/v8/commands/npm-link) with your React app

Using Storybook with Create React Package is simple. Initialize a new project with Storybook using `--sb` or `--storybook` flag.

```sh
npx create-react-package my-package --sb
```

Or, add Storybook to your existing project by running:

```sh
npx storybook init
```

### Build and Publish

Create an optimized production build by running the `build` script. This will create a `dist` folder that may contain any or all of the folders based on your project setup and configuration:

- cjs: Your library bundled in CommonJS format.
- esm: Your library bundled in ECMAScript Modules format.
- umd: Your library bundled in Universal Module Definition.
- types: TypeScript declarations.
- css: Minified CSS Bundle.

> Note: If you are using CJS as one of the module formats, it will create a file `dist/index.js` that loads CJS dev/prod builds based on the NodeJS environment.

Create React Package adds the following NPM configuration to your package.json.

```json
{
  "main": "dist/index.js (path to CJS build)",
  "module": "dist/esm/{your-package-name}.js (path to ES Module build)",
  "types": "dist/types/index.d.ts (path to TypeScript declarations)",
  "files": ["dist (files/folders that will be published to the NPM registry)"]
}
```

This build can now be published to NPM.

## Philosophy

Create React Package is divided into two packages:

- `create-react-package` is a command line tool to set up a new React package.
- `react-package-scripts` is a development dependency in the generated projects that encapsulates all the build tools.

## Customization

Create React Package uses Rollup, Babel, Jest, and ESLint under the hood. These tools are pre-configured, and the default configuration is enough for most packages but you can customize them to your needs.

> Customization can invalidate the default behavior of Create React Package. Please use with discretion.

Create a file called `crp.config.js` at the root of your project like so:

```js
const { defineConfig } = require('react-package-scripts');

module.exports = defineConfig({
  // options
});
```

> Note: Create React Package does not support ES modules syntax in the config file, so use plain Node.js

### Config Intellisense

Since Create React Package ships with TypeScript typings, you can leverage your IDE's IntelliSense with JSDoc type hints:

```js
// crp.config.js

/**
 * @type {import('react-package-scripts').UserConfig}
 */
const config = {
  // options
};

module.exports = config;
```

Alternatively, you can use the `defineConfig` helper which should provide IntelliSense without the need for JSDoc annotations:

```js
// crp.config.js

const { defineConfig } = require('react-package-scripts');

module.exports = defineConfig({
  // options
});
```

### Config Options

You can provide the following options to customize the build.

#### input

- **Type**: `string`
- **Default**: `src/index`

  Entry point

#### outDir

- **Type**: `string`
- **Default**: `dist`

  Directory relative from root where build output will be placed. If the directory exists, it will be removed before the build.

#### formats

- **Type**: `string[]`
- **Default**: `['cjs', 'esm']`

  Bundle formats. Available formats are `cjs`, `esm`, and `umd`

#### name

- **Type**: `string`
- **Default**: `camel-cased version of your package name`

  Name to expose in the UMD build. Use this option when you are using `umd` as one of the build formats.

#### disableESLint

- **Type**: `boolean`
- **Default**: `false`

  Disable code linting with ESLint.

#### rollupOptions

- **Type**: `RollupOptions | ((config: RollupOptions, options: { format: string, mode: string }) => RollupOptions)`

  Directly customize the underlying Rollup bundle. These options will be merged with Create React Package's internal Rollup options. See [Rollup options docs](https://rollupjs.org/guide/en/#big-list-of-options) for more details.

### Rollup

Create React Package uses Rollup to bundle your library. To customize the rollup configuration, create a file `crp.config.js` at the root of your package and pass any rollup options.

```js
const { defineConfig } = require('react-package-scripts');

module.exports = defineConfig({
  rollupOptions: {
    // rollup options
  },
});
```

#### Conditional Rollup Config

If the config needs to conditionally determine options based on the module format or the mode being used, a function can be used as value of `rollupOptions`.

```js
module.exports = defineConfig({
  rollupOptions: (config, { format, mode }) => {
    if (format === 'cjs' && mode === 'production') {
      // config options only for the CJS Production build
    }

    return config;
  },
});
```

#### Example: Import images

To import and ship your package with JPG, PNG, GIF, SVG, and WebP files, use [@rollup/plugin-image](https://www.npmjs.com/package/@rollup/plugin-image). First, install it as a dev dependency

```sh
npm i -D @rollup/plugin-image
```

And use it in the `crp.config.js`

```js
const { defineConfig } = require('react-package-scripts');
const images = require('@rollup/plugin-image');

module.exports = defineConfig({
  rollupOptions: {
    plugins: [images()],
  },
});
```

Now, you can import images like

```jsx
import React from 'react';
import image from './image.png';

return <img src={image} />;
```

> Note: If you are using TypeScript, create a folder and file `types/index.d.ts` at the root of your project with the following to make it work with TypeScript compiler.

```ts
declare module '*.png';
declare module '*.jpg';
```

### Babel

Create React Package respects [Babel configuration files](https://babeljs.io/docs/en/config-files).

#### Example: Optimize Lodash

If you use a lodash function in your library like `import { cloneDeep } from 'lodash'` the compiled bundle will contain all of the lodash's library.

Ideally, your compiled bundle should only contain what you use in the source of your library. Create React Package helps you do that with some Babel configuration.

Install [lodash](https://www.npmjs.com/package/lodash) and [babel-plugin-import](https://www.npmjs.com/package/babel-plugin-import) in your package.

```sh
npm i lodash
npm i -D babel-plugin-import
```

Create a file `.babelrc` at the root of your project with the following.

```json
{
  "plugins": [
    [
      "import",
      {
        "libraryName": "lodash",
        "libraryDirectory": "",
        "camel2DashComponentName": false
      }
    ]
  ]
}
```

This Babel configuration will be merged with Create React Package's internal config. Now, your bundle will not include all lodash functions, just the functions you import into your project.

### ESLint

Create React Package respects [ESLint configuration files](https://eslint.org/docs/latest/user-guide/configuring/configuration-files).

To disable linting, pass `disableESLint: true` option to `crp.config.js`

```js
const { defineConfig } = require('react-package-scripts');

module.exports = defineConfig({
  disableESLint: true,
});
```

To ignore any files, create a `.eslintignore` file at the root of the package.

### Jest

Create React Package executes the following files with Jest test runner:

- Files with `.js` suffix in `__tests__` folders. (under any level, not only in src)
- Files with `.test.js` suffix.
- Files with `.spec.js` suffix.

> Note: `.js`, `.jsx`, `.ts`, `.tsx` file extensions are supported.

You can override Create React Package's [default Jest configuration](https://github.com/haseebanwar/create-react-package/blob/master/packages/react-package-scripts/src/scripts/test.js) by adding any of the [Jest Options](https://jestjs.io/docs/27.x/configuration#options) to package.json.

Example package.json

```json
{
  "name": "your-package",
  "jest": {
    "collectCoverage": true,
    "collectCoverageFrom": [
      "**/*.{js,jsx}",
      "!**/node_modules/**",
      "!**/vendor/**"
    ]
  }
}
```

Note that this config is shallow merged.

#### CLI Options

You can pass [Jest CLI options](https://jestjs.io/docs/27.x/cli) to the `test` script in your package.json.

```diff
  "scripts": {
-    "test": "react-package-scripts test"
+    "test": "react-package-scripts test --watchAll"
  }
```

## Styling

Create React Package lets you ship your package with CSS assets. You can import stylesheets in your JavaScript files straight away without doing any additional setup.

```css
/* Button.css */

.Button {
  padding: 15px;
}
```

And then in your JavaScript file

```jsx
// Button.js

import React from 'react';
import './Button.css';

const Button = () => {
  return <div className="Button" />;
};
```

Create React Package concatenates all your stylesheets into a single minified `.css` file and places it in the build output.

> Tip: CSS Modules are also supported.

### Sass/Stylus/Less Files

- For Sass, install [sass](https://www.npmjs.com/package/sass): `npm i -D sass`
- For Stylus, install [stylus](https://www.npmjs.com/package/stylus): `npm i -D stylus`
- For Less, install [less](https://www.npmjs.com/package/less): `npm i -D less`

That's it, you can now import `.styl` `.scss` `.sass` `.less` files in your project.

### Post-Processing CSS

This project uses [rollup-plugin-postcss
](https://www.npmjs.com/package/rollup-plugin-postcss) that integrates Rollup with [PostCSS](https://github.com/postcss/postcss). In addition to that, it adds vendor prefixes automatically to the bundled CSS through [Autoprefixer](https://github.com/postcss/autoprefixer) so you don’t need to worry about it.

You can customize your target support browsers by adjusting the `browserslist` key in package.json. You can read more about Browserslist configuration [here](#configure-supported-browsers).

For example, this:

```css
div {
  user-select: none;
}
```

is transformed into this:

```css
div {
  -webkit-user-select: none;
  user-select: none;
}
```

If you need to disable autoprefixing, follow [autoprefixer disabling section](https://github.com/postcss/autoprefixer#disabling).

## Advanced Usage

### Code Splitting

It is recommended that you do code splitting in your app and not in the library. But if you still need to code split your library for some reason, Create React Package got your back.

This project supports code splitting via dynamic `import()`.

For example:

```js
// greeting.js

const greeting = 'Hi there!';

export { greeting };
```

```jsx
// index.js

import React from 'react';

const MyComponent = () => {
  const handleClick = async () => {
    try {
      const { greeting } = await import('./greeting');
      console.log(greeting); // prints: Hi there!
    } catch (error) {
      // handle failure
    }
  };

  return <button onClick={handleClick}>Load</button>;
};
```

You can also use React `lazy` and `Suspense` to load components lazily.

> Note: Code-splitting is not supported for UMD format.

### Configure Supported Browsers

Create React Package uses [Browserslist](https://github.com/browserslist/browserslist) to target a broad range of browsers. By default, the generated project includes the following Browserslist configuration in package.json.

```json
"browserslist": {
  "production": [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ],
  "development": [
    "last 1 chrome version",
    "last 1 firefox version",
    "last 1 safari version"
  ]
},
```

The `browserslist` configuration controls the outputted JavaScript and CSS so that the emitted code will be compatible with the browsers specified. The `production` list will be used when creating a production build with the `build` script, and the `development` list will be used with the `watch` script.

You can adjust this configuration according to the [Browserslist specification](https://github.com/browserslist/browserslist#readme).

> Note: This configuration does not include polyfills automatically.

## Author

- [Haseeb Anwar](https://haseebanwar.net/)

## License

Create React Package is open-source software [licensed as MIT](https://github.com/haseebanwar/create-react-package/blob/master/LICENSE).
