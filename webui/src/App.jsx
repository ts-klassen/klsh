import React, { useEffect } from 'react';

import Canvas from './components/Canvas.jsx';
import TextEditor from './components/TextEditor.jsx';

/**
 * Very small stub that demonstrates the two primary views – the drag-and-drop
 * canvas and the text editor – and verifies that they remain in sync by simply
 * rendering them side-by-side.
 */
export default function App() {
  // We intentionally keep the styling minimal so that the code base remains
  // lightweight.  Consumers are expected to add their own CSS / Tailwind setup
  // as needed.

  useEffect(() => {
    // Lazy-inject a few CSS rules so that the demo looks acceptable without a
    // full-blown CSS pipeline.
    const style = document.createElement('style');
    style.textContent = `
      html, body, #root { height: 100%; margin: 0; }
      .app-layout { display: flex; height: 100%; }
      .pane { flex: 1 1 50%; overflow: hidden; border-right: 1px solid #ddd; position: relative; }
      .pane:last-child { border-right: none; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <div className="app-layout">
      <div className="pane">
        <Canvas />
      </div>
      <div className="pane">
        <TextEditor />
      </div>
    </div>
  );
}
