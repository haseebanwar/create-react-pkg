# Create React Package <!-- omit in toc -->

Create React packages with no build configuration.

## Quick Overview <!-- omit in toc -->

```sh
npx create-react-package my-package
cd my-package
npm start
```

You don’t need to install or configure tools like Rollup, Babel, or ESLint. They are preconfigured and hidden so that you can focus on the code.

<p align='center'>
<img src='https://cdn.jsdelivr.net/gh/facebook/create-react-app@27b42ac7efa018f2541153ab30d63180f5fa39e0/screencast.svg' width='600' alt='npm start'>
</p>

## Contents <!-- omit in toc -->

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
  - [Babel](#babel)
    - [Example: Optimize Lodash](#example-optimize-lodash)
  - [ESLint](#eslint)
  - [Jest](#jest)
- [How to Update to New Versions?](#how-to-update-to-new-versions)
- [What’s Included?](#whats-included)
- [Author](#author)
- [License](#license)
- [Styling](#styling)

## Why

- Get started in seconds, easy to maintain, just one dependency
- CJS, ESM, and UMD module support
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

Watches for file changes in development mode. You will see the build errors and lint warnings in the console.

<p align='center'>
<img src='https://cdn.jsdelivr.net/gh/marionebl/create-react-app@9f6282671c54f0874afd37a72f6689727b562498/screencast-error.svg' width='600' alt='Build errors'>
</p>

#### `npm test` or `yarn test`

Runs the test watcher in an interactive mode.<br>
By default, runs tests related to files changed since the last commit.

[Read more about testing.](https://facebook.github.io/create-react-app/docs/running-tests)

#### `npm run build` or `yarn build`

Builds the package for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

Your package is ready to be published.

## Philosophy

Create React Package is divided into two packages:

- `create-react-package` is a command line tool that you use to create new react packages.
- `react-package-scripts` is a development dependency in the generated projects that encapsulates all the build tools.

## Customization

Create React Package uses Rollup, Babel, Jest, and ESLint under the hood. These tools are pre-configured and the default configuration is enogh for most packages but you can customize them to your needs.

Create a file called `rps.config.js` at the root of your project like so:

```js
const { defineConfig } = require('react-package-scripts');

module.exports = defineConfig({
  // react-package-scripts options
});
```

> Note: Create React Package does not support ES modules syntax in the config file, so use plain Node.js

### Config Intellisense

Since Create React Package ships with TypeScript typings, you can leverage your IDE's intellisense with JSDoc type hints:

```js
// rps.config.js

/**
 * @type {import('react-package-scripts').UserConfig}
 */
const config = {
  // react-package-scripts options
};

module.exports = config;
```

Alternatively, you can use the `defineConfig` helper which should provide intellisense without the need for JSDoc annotations:

```js
// rps.config.js

const { defineConfig } = require('react-package-scripts');

module.exports = defineConfig({
  // react-package-scripts options
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

  Directory relative from `root` where build output will be placed. If the directory exists, it will be removed before the build.

#### formats

- **Type**: `string`
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

- **Type**: [`RollupOptions`](https://rollupjs.org/guide/en/#big-list-of-options)

  Directly customize the underlying Rollup bundle. These options will be merged with `react-package-script`'s internal Rollup options. See [Rollup options docs](https://rollupjs.org/guide/en/#big-list-of-options) for more details.

### Rollup

### Babel

Create React Package respects [Babel configuration files](https://babeljs.io/docs/en/config-files).

#### Example: Optimize Lodash

Install [lodash](https://www.npmjs.com/package/lodash) and [babel-plugin-import](https://www.npmjs.com/package/babel-plugin-import)

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

Now, your bundle will not include all of lodash's methods. Just the methods you import in your project.

### ESLint

Create React Package respects [ESLint configuration files](https://eslint.org/docs/latest/user-guide/configuring/configuration-files).

To disable linting, pass `disableESLint: true` option to `rps.config.js` like

```js
const { defineConfig } = require('react-package-scripts');

module.exports = defineConfig({
  disableESLint: true,
});
```

To ignore any files, create a `.eslintignore` at the root of the package.

### Jest

The following files will be executed with the test runner

- Files with .js suffix in **tests** folders. (under any level not only in src)
- Files with .test.js suffix.
- Files with .spec.js suffix.

Pass your [Jest Configuration](https://jestjs.io/docs/configuration#reference) in the package.json and react package scripts will shallow merge it.

```js
{
  "name": "your-package",
  "jest": {
    // jest config
  }
}
```

## How to Update to New Versions?

Please refer to the [User Guide](https://facebook.github.io/create-react-app/docs/updating-to-new-releases) for this and other information.

## What’s Included?

Your environment will have everything you need to build a modern single-page React app:

- React, JSX, ES6, TypeScript and Flow syntax support.
- Language extras beyond ES6 like the object spread operator.
- Autoprefixed CSS, so you don’t need `-webkit-` or other prefixes.
- A fast interactive unit test runner with built-in support for coverage reporting.
- A live development server that warns about common mistakes.
- A build script to bundle JS, CSS, and images for production, with hashes and sourcemaps.

## Author

- [Haseeb Anwar](https://haseebanwar.net/)

## License

Create React Package is open source software [licensed as MIT](https://github.com/haseebanwar/create-react-package/blob/master/LICENSE).

## Styling
