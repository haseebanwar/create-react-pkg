import React, { useState, useEffect } from 'react';

var index = 42;

const TestC = props => {
  const [test, setTest] = useState('');
  useEffect(() => {
    console.log('firsts', test, index);
  }, [test]);
  return /*#__PURE__*/React.createElement("div", {
    onClick: setTest
  }, /*#__PURE__*/React.createElement("h1", null, " ", test), /*#__PURE__*/React.createElement("p", null, "My props are"), /*#__PURE__*/React.createElement("pre", null, JSON.stringify(props, null, 2)));
};

export { TestC };
//# sourceMappingURL=bundle.js.map
