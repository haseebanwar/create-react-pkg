import React from 'react';

export const Things = (props) => {
  const doSomething = async () => {
    const foo = await import('./foo');
    console.log('foo', foo);
  };

  return (
    <div>
      These are Things
      <h1>My props are</h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
      <button onClick={doSomething}>Load dynamic import</button>
    </div>
  );
};
