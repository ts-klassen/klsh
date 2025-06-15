import React, { useEffect, useRef } from 'react';

// Zustand store helpers
import { usePipelineStore } from '../store/pipeline.jsx';
import text2json from '../util/text2json.js';
import json2text from '../util/json2text.js';

// ---------------------------------------------------------------------------
// Monaco Editor setup
// ---------------------------------------------------------------------------

// Pull in the ESM build (works fine with Vite)
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main';
import 'monaco-editor/min/vs/editor/editor.main.css';
// Register Bash/Shell syntax highlighting
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution';

// IMPORTANT:  The worker has to be imported so Vite can bundle it.  The
// `?worker` suffix instructs Vite to treat the imported module as a Web
// Worker and returns a URL.  We then instantiate the worker via that URL when
// Monaco asks for it.

// eslint-disable-next-line import/no-unresolved
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

/* global self */
// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

// ---------------------------------------------------------------------------
// Small debounce helper (250 ms)
// ---------------------------------------------------------------------------

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// ---------------------------------------------------------------------------
// Monaco implementation
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
        try {
          skipStoreSyncRef.current = true; // mark as user-originated
          const json = text2json(raw);
          if (json) setPipeline(json);
        } catch (_) {
          /* ignore parse errors */
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

export default function TextEditor() {
  return <MonacoEditor />;
}
