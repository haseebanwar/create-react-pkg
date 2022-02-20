import React from 'react';

const Thingss = ({
  foo
}) => {
  const doSomething = async () => {
    const t = await import('./test-9f919b44.js');
    console.log('t', t);
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "Test",
    onClick: doSomething
  }, "the snozzberries taste like stawberries....", foo);
};

export { Thingss };
