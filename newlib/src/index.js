import React, { useEffect, useState } from 'react';
import answer from 'the-answer';

export const TestC = (props) => {
  const [test, setTest] = useState('');

  useEffect(() => {
    console.log('firsts', test, answer);
  }, [test]);

  return (
    <div onClick={setTest}>
      <h1> {test}</h1>
      <p>My props are</p>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
};
