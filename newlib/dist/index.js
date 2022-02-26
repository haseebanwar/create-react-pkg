'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/newlib.min.js');
} else {
  module.exports = require('./cjs/newlib.js');
}