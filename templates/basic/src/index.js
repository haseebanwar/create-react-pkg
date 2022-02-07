import React, { useEffect, useState } from 'react';

export const TestC = () => {
  const [test, setTest] = useState('');

  useEffect(() => {
    console.log('first', test);
  }, []);

  return (
    <div onClick={setTest}>
      <h1> {test}</h1>
      <p>My props are</p>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
};
