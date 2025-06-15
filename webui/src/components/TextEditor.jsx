import React, { useEffect, useRef } from 'react';

// Utilities shared between the Monaco and <textarea> implementations.
import { usePipelineStore } from '../store/pipeline.jsx';
import text2json from '../util/text2json.js';
import json2text from '../util/json2text.js';

// ---------------------------------------------------------------------------
// Simple debounce helper (250 ms)
// ---------------------------------------------------------------------------
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// ---------------------------------------------------------------------------
// eslint-disable-next-line import/no-extraneous-dependencies
// We rely on the ESM build of Monaco which works smoothly with Vite without
// additional plugins.
// See https://github.com/microsoft/monaco-editor#using-loader-or-esm for details.
//
// - editor.api.js exposes the full API *without* automatically attempting to
//   spin up Web-Workers.
// - We therefore wire up the single generic editor worker manually below.  For
//   our current usage (a simple shell/plaintext language) this is fully
//   sufficient and keeps the bundle small.

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/min/vs/editor/editor.main.css';

// ---------------------------------------------------------------------------
// Web-Worker wiring – required when consuming the ESM build inside Vite.
// ---------------------------------------------------------------------------

/* global self */
// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
  getWorker() {
    // `editor.worker` provides tokenization, code folding etc. for *all*
    // languages when no dedicated worker is registered – perfect for our use
    // case (custom "shell" language defined elsewhere).
    //
    // The `?worker` suffix lets Vite treat the import as a Web-Worker module.
    // The 
    //   { type: 'module' }
    // option makes sure the browser interprets it as an ES module so that all
    // imports inside the worker keep working.
    //
    // Ref: https://vitejs.dev/guide/features.html#web-workers
    //
    // We do *not* lazily create different workers per label because we only
    // ever use the generic one.

    return new Worker(
      new URL(
        'monaco-editor/esm/vs/editor/editor.worker?worker',
        import.meta.url
      ),
      { type: 'module' }
    );
  },
};

// ---------------------------------------------------------------------------
// 2. Monaco implementation
// ---------------------------------------------------------------------------

function MonacoEditor() {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const internalChangeRef = useRef(false);
  const lastSyncedRef = useRef('');
  const skipStoreSyncRef = useRef(false);

  const pipeline = usePipelineStore((s) => s.pipeline);
  const setPipeline = usePipelineStore((s) => s.setPipeline);

  // Mount Monaco once
  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    // eslint-disable-next-line no-console
    console.log('[MonacoEditor] Initialising Monaco');

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: '',
      language: 'shell',
      automaticLayout: true,
      minimap: { enabled: false },
      theme: 'vs-dark',
    });

    const model = editorRef.current.getModel();

    const changeSub = model.onDidChangeContent(
      debounce(() => {
        if (internalChangeRef.current) return;

        const raw = model.getValue();
        // eslint-disable-next-line no-console
        console.log('[MonacoEditor] onDidChangeContent – raw text:', raw);

        try {
          skipStoreSyncRef.current = true; // mark as user-originated
          const json = text2json(raw);
          // eslint-disable-next-line no-console
          console.log('[MonacoEditor] text2json result:', json);
          if (json) setPipeline(json);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[MonacoEditor] Parsing failed:', err);
        }
      }, 250)
    );

    return () => {
      changeSub.dispose();
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, [setPipeline]);

  // store → editor
  useEffect(() => {
    if (!editorRef.current) return;
    const expected = json2text(pipeline);
    if (skipStoreSyncRef.current) {
      // Store update came from same editor action; ignore once.
      skipStoreSyncRef.current = false;
    } else if (expected !== lastSyncedRef.current) {
      internalChangeRef.current = true;
      editorRef.current.setValue(expected);
      internalChangeRef.current = false;
      lastSyncedRef.current = expected;
    }
  }, [pipeline]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

// ---------------------------------------------------------------------------
// 3. Public component
// ---------------------------------------------------------------------------

export default function TextEditor() {
  return <MonacoEditor />;
}
