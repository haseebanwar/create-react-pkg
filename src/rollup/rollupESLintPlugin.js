import { ESLint } from 'eslint';
import { createFilter } from '@rollup/pluginutils';

function getLintingReport(results) {
  return results.reduce(
    (acc, result) => {
      acc.errorCount += result.errorCount;
      acc.warningCount += result.warningCount;
      return acc;
    },
    { errorCount: 0, warningCount: 0 }
  );
}

function eslint(options = {}) {
  const defaultFormatter = 'stylish';
  const {
    throwOnError = true,
    throwOnWarning = false,
    formatter = defaultFormatter,
    include = [],
    exclude = [/node_modules/, /\.json|\.s?css$/],
  } = options;

  const eslint = new ESLint({ useEslintrc: false });
  const filter = createFilter(include, exclude);

  return {
    name: 'eslint',
    shouldTransformCachedModule({ id, meta }) {
      // if current module is a node_module or .json/.css then skip
      if (!filter(id)) return;

      if (meta.eslint && (meta.eslint.warningCount || meta.eslint.errorCount)) {
        this.warn({
          message: 'Lint warnings',
          lintWarnings: meta.eslint.resultText,
        });
      }
    },
    transform: async function transform(code, id) {
      // if current module is a node_module or .json/.css then skip
      if (!filter(id)) return;

      const results = await eslint.lintText(code, {
        filePath: id,
      });

      const { errorCount, warningCount } = getLintingReport(results);

      let lintFormatter;
      switch (typeof formatter) {
        case 'string': {
          lintFormatter = (await eslint.loadFormatter(formatter)).format;
          break;
        }
        case 'function': {
          lintFormatter = formatter;
          break;
        }
        default: {
          lintFormatter = (await eslint.loadFormatter(defaultFormatter)).format;
          break;
        }
      }
      const resultText = lintFormatter(results);

      if (throwOnError && errorCount) {
        const error = new Error('Lint errors');
        error.lintErrors = resultText;
        throw error;
      }

      if (throwOnWarning && warningCount) {
        const error = new Error('Lint warnings');
        error.lintWarnings = resultText;
        throw error;
      }

      if (warningCount) {
        this.warn({
          message: 'Lint warnings',
          lintWarnings: resultText,
        });
      }

      // store lint errors/warnings in the meta field for this module
      // so in the shouldTransformCachedModule hook we don't have to lint cached modules again
      // instead show cached errors/warnings for that module
      return { meta: { eslint: { resultText, warningCount, errorCount } } };
    },
  };
}

export default eslint;
