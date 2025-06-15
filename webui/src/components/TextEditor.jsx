import React, { useEffect, useRef, useState } from 'react';

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
// 1. Try to load Monaco Editor.  If that fails for any reason we fall back to
//    a plain <textarea>.  This guarantees that typing in the right pane always
//    works – even in environments where web-workers or import.meta.url issues
//    prevent Monaco from initialising correctly.
// ---------------------------------------------------------------------------

let monaco = null;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  monaco = require('monaco-editor');
} catch (_) {
  // Ignore – we’ll use the fallback component below.
}

// ---------------------------------------------------------------------------
// 2. Fallback implementation – controlled <textarea>
// ---------------------------------------------------------------------------

function FallbackEditor() {
  const [value, setValue] = useState('');
  const lastSyncedRef = useRef('');
  const skipStoreSyncRef = useRef(false);

  const pipeline = usePipelineStore((s) => s.pipeline);
  const setPipeline = usePipelineStore((s) => s.setPipeline);

  // Local → store
  const onChange = debounce((next) => {
    skipStoreSyncRef.current = true; // this update originates from user typing
    // eslint-disable-next-line no-console
    console.log('[FallbackEditor] onChange – raw text:', next);
    try {
      const json = text2json(next);
      // eslint-disable-next-line no-console
      console.log('[FallbackEditor] text2json result:', json);
      if (json) setPipeline(json);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[FallbackEditor] Parsing failed:', err);
    }
  }, 250);

  // store → local
  useEffect(() => {
    const expected = json2text(pipeline);
    if (skipStoreSyncRef.current) {
      // Skip once – this store update was triggered by the same editor.
      skipStoreSyncRef.current = false;
    } else if (expected !== lastSyncedRef.current) {
      lastSyncedRef.current = expected;
      setValue(expected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline]);

  return (
    <textarea
      style={{ width: '100%', height: '100%', resize: 'none' }}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// 3. Monaco implementation (only used if import succeeded)
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
// 4. Public component: pick Monaco if available, else fallback.
// ---------------------------------------------------------------------------

export default function TextEditor() {
  if (monaco) return <MonacoEditor />;
  // eslint-disable-next-line no-console
  console.warn('[TextEditor] Monaco not available – using <textarea> fallback');
  return <FallbackEditor />;
}
