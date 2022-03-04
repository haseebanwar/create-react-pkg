import React, { FC } from 'react';

export interface MyComponentProps {
  /**
   * inner content
   */
  label?: string;
}

export const MyComponent: FC<MyComponentProps> = (props) => {
  // const doSomething = async () => {
  //   const test = await import('./test');
  //   console.log('test', test);
  // };

  return (
    <div>
      These are Things
      <p>{props.label}</p>
      <pre>{JSON.stringify(props, null, 2)}</pre>
      <button
      // onClick={doSomething}
      >
        Load dynamic import
      </button>
    </div>
  );
};

export * from './test1';
