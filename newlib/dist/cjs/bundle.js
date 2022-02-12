'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var index = 42;

const TestC = props => {
  const [test, setTest] = React.useState('');
  React.useEffect(() => {
    console.log('firsts', test, index);
  }, [test]);
  return /*#__PURE__*/React__default["default"].createElement("div", {
    onClick: setTest
  }, /*#__PURE__*/React__default["default"].createElement("h1", null, " ", test), /*#__PURE__*/React__default["default"].createElement("p", null, "My props are"), /*#__PURE__*/React__default["default"].createElement("pre", null, JSON.stringify(props, null, 2)));
};

exports.TestC = TestC;
//# sourceMappingURL=bundle.js.map
