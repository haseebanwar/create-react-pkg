# Getting Started with Create React Package

This package was bootstrapped with [Create React Package](https://github.com/haseebanwar/create-react-pkg). A zero-config tool for creating React libraries.

## Available Scripts

In the project directory, you can run:

### `npm start` or `yarn start`

Watches for changes and rebuilds. To see your bundled React component in a browser, use integrated playground with [npm run preview](#npm-run-preview-or-yarn-preview)

Note that this build is not optimized. Use `npm run build` to create an optimized build.

### `npm test` or `yarn test`

Runs tests with Jest.

To launch the test runner in the interactive watch mode, change the `test` script in `package.json`

```diff
  "scripts": {
-   "test": "react-pkg-scripts test"
+   "test": "react-pkg-scripts test --watch"
  }
```

### `npm run build` or `yarn build`

Builds the package for production to the `dist` folder. By default, it bundles your package in two module formats, CJS and ESM. But you can also create a UMD build by creating a file `crp.config.js` at the root of project with the following.

```js
const { defineConfig } = require('react-pkg-scripts');

module.exports = defineConfig({
  formats: ['cjs', 'esm', 'umd'],
});
```

### `npm run preview` or `yarn preview`

Opens React app development server from `playground/index.js` for previewing your library in browser. It comes with live reload that makes development much easier.

Note that the integrated playground depends on the ESM output of your library. So, please run `npm start` with ESM build before running `npm run preview`

## Learn More

You can learn more in the [Create React Package documentation](https://github.com/haseebanwar/create-react-pkg#readme).
