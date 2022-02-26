import React from 'react';
import ReactDOM from 'react-dom';
import { MyComponent } from '../src';

describe('it', () => {
  it('renders the right text', () => {
    const container = document.createElement('div');
    ReactDOM.render(<MyComponent />, container);
    expect(container.textContent).toBe('Happy coding!');
  });
});
