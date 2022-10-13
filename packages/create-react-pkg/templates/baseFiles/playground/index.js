import React from 'react';
import { createRoot } from 'react-dom/client';
import { MyComponent } from '../';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<MyComponent />);
