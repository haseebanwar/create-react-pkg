'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const MyComponent = props => {
  const doSomething = async () => {
    const foo = await Promise.resolve().then(function () { return require('./foo-7c99c014.js'); });
    console.log('foo', foo);
  };

  return /*#__PURE__*/React__default["default"].createElement("div", null, "These are Things", /*#__PURE__*/React__default["default"].createElement("h1", null, "My props are"), /*#__PURE__*/React__default["default"].createElement("pre", null, JSON.stringify(props, null, 2)), /*#__PURE__*/React__default["default"].createElement("button", {
    onClick: doSomething
  }, "Load dynamic import"));
};

exports.MyComponent = MyComponent;
//# sourceMappingURL=newlib.js.map
