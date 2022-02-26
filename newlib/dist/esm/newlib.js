import React from 'react';

const MyComponent = props => {
  const doSomething = async () => {
    const foo = await import('./foo-7f1d950a.js');
    console.log('foo', foo);
  };

  return /*#__PURE__*/React.createElement("div", null, "These are Things", /*#__PURE__*/React.createElement("h1", null, "My props are"), /*#__PURE__*/React.createElement("pre", null, JSON.stringify(props, null, 2)), /*#__PURE__*/React.createElement("button", {
    onClick: doSomething
  }, "Load dynamic import"));
};

export { MyComponent };
//# sourceMappingURL=newlib.js.map
