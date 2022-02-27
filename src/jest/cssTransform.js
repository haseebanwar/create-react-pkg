// custom jest transformer for handling css, scss, etc. files
export default {
  process() {
    // these files are transformed to this
    return 'module.exports = {};';
  },
  getCacheKey() {
    // The output is always the same.
    return 'cssTransform';
  },
};
