import React from 'react';
import { logHello } from './test1';

export const Things = (props: any) => {
  // const doSomething = async () => {
  //   const test = await import('./test');
  //   console.log('test', test);
  // };

  console.log(logHello());

  return (
    <div>
      These are Things
      <h1>My props are</h1>
      <pre>{JSON.stringify(props, null, 2)}</pre>
      <button
      // onClick={doSomething}
      >
        Load dynamic import
      </button>
    </div>
  );
};
