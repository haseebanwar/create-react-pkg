# Getting Started with Create React Package

This package was bootstrapped with [Create React Package](https://github.com/haseebanwar/create-react-pkg). A zero-config CLI for creating React component libraries.

## Available Scripts

In the project directory, you can run:

### `npm start` or `yarn start`

Watches for changes as you build. To see your bundled React component in a browser, import and use it in a React app either by symlinking the package with `npm link` or by publishing it to NPM.

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

Builds the package for production to the `dist` folder. It bundles your package in three module formats, CJS, ES, and UMD.

## Learn More

You can learn more in the [Create React Package documentation](https://github.com/haseebanwar/create-react-pkg#readme).
