import React from 'react';
import { createRoot } from 'react-dom/client';
import { MyComponent } from '../src';

describe('it', () => {
  it('renders', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(<MyComponent />);
    root.unmount();
  });
});
