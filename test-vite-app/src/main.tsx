import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => (
  <div>
    <h2>React is working! 🎉</h2>
    <p>This content is rendered by React.</p>
  </div>
);

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
