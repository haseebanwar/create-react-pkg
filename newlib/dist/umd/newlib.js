(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.newlib = {}, global.React));
})(this, (function (exports, React) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

  const MyComponent = props => {
    const doSomething = async () => {
      const foo$1 = await Promise.resolve().then(function () { return foo; });
      console.log('foo', foo$1);
    };

    return /*#__PURE__*/React__default["default"].createElement("div", null, "These are Things", /*#__PURE__*/React__default["default"].createElement("h1", null, "My props are"), /*#__PURE__*/React__default["default"].createElement("pre", null, JSON.stringify(props, null, 2)), /*#__PURE__*/React__default["default"].createElement("button", {
      onClick: doSomething
    }, "Load dynamic import"));
  };

  const a = 23;

  var foo = {
    __proto__: null,
    a: a
  };

  exports.MyComponent = MyComponent;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=newlib.js.map
