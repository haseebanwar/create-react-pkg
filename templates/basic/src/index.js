import React, { useState } from 'react';

const HelloWorld = (props) => {
  const [test] = useState('hello there');

  return (
    <div>
      <h1> {test}</h1>
      <p>My props are</p>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
};

export default HelloWorld;
