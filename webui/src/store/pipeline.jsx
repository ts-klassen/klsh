import React, { createContext, useContext, useRef } from 'react';
import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Pipeline JSON store (Zustand)
// ---------------------------------------------------------------------------

export const usePipelineStore = create((set, get) => ({
  pipeline: [],
  setPipeline: (json) => set({ pipeline: json }),
  update: (fn) => {
    const draft = JSON.parse(JSON.stringify(get().pipeline));
    fn(draft);
    set({ pipeline: draft });
  },
}));

// Expose for debugging in the browser console (development only)
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  // eslint-disable-next-line no-console
  console.info('Pipeline store accessible via window.__PIPELINE_STORE__');
  // eslint-disable-next-line no-underscore-dangle
  window.__PIPELINE_STORE__ = usePipelineStore;

  // Tiny helper: quickly build a linear pipeline from a Bash string
  // Example in console:  loadPipeline('echo hello | cat | head -n1')
  window.loadPipeline = (bashStr) => {
    if (typeof bashStr !== 'string') return;

    const commands = bashStr.split('|').map((s) => s.trim()).filter(Boolean);
    if (!commands.length) return;

    const cmdObjs = commands.map((cmdTxt) => {
      const parts = cmdTxt.split(/\s+/);
      return {
        component: [{ type: 'text', value: parts[0] }],
        params: parts.slice(1).map((p) => [{ type: 'text', value: p }]),
        redirect: [],
      };
    });

    for (let i = 0; i < cmdObjs.length - 1; i++) {
      cmdObjs[i].pipe = cmdObjs[i + 1];
    }

    usePipelineStore.getState().setPipeline([cmdObjs[0]]);
  };
}

// React context wrapper so non-hook code can access the store instance.
const StoreContext = createContext(null);

export function PipelineProvider({ children }) {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = usePipelineStore;
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('PipelineProvider missing');
  return store;
}
