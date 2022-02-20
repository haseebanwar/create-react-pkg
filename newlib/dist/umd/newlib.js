(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.newlib = {}, global.React));
})(this, (function (exports, React) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

  const Thingss = ({
    foo
  }) => {
    const doSomething = async () => {
      const t = await Promise.resolve().then(function () { return test; });
      console.log('t', t);
    };

    return /*#__PURE__*/React__default["default"].createElement("div", {
      className: "Test",
      onClick: doSomething
    }, "the snozzberries taste like stawberries....", foo);
  };

  const a = 23;

  var test = /*#__PURE__*/Object.freeze({
    __proto__: null,
    a: a
  });

  exports.Thingss = Thingss;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
