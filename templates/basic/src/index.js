import React from 'react';

// Delete me
export const Thingss = ({ foo }) => {
  const doSomething = async () => {
    const t = await import('./test');
    console.log('t', t);
  };
  return (
    <div className="Test" onClick={doSomething}>
      the snozzberries taste like stawberries....{foo}
    </div>
  );
};
