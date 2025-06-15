import React from 'react';
import { createRoot } from 'react-dom/client';

import { PipelineProvider } from './store/pipeline.jsx';
import App from './App.jsx';

// Bootstrap React application and wrap it in the Zustand provider so that the
// pipeline JSON store is available to the entire component tree.

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <PipelineProvider>
      <App />
    </PipelineProvider>
  </React.StrictMode>
);
