import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

import { usePipelineStore } from '../store/pipeline.jsx';
import text2json from '../util/text2json.js';
import json2text from '../util/json2text.js';

// Debounce helper
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export default function TextEditor() {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const pipeline = usePipelineStore((s) => s.pipeline);
  const setPipeline = usePipelineStore((s) => s.setPipeline);

  // Flag to prevent infinite update loops (text → store → text → store …).
  const internalChangeRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: '',
      language: 'shell',
      automaticLayout: true,
      minimap: { enabled: false },
      theme: 'vs-dark',
    });

    // Handle edits → parse → store.
    const model = editorRef.current.getModel();
    const handle = model.onDidChangeContent(
      debounce(() => {
        if (internalChangeRef.current) return;

        try {
          const json = text2json(model.getValue());
          if (json) setPipeline(json);
        } catch (_) {
          // Invalid syntax – ignore for now.
        }
      }, 250)
    );

    return () => handle.dispose();
  }, [setPipeline]);

  // Sync store → text editor.
  useEffect(() => {
    if (!editorRef.current) return;
    const expected = json2text(pipeline);
    if (editorRef.current.getValue() !== expected) {
      internalChangeRef.current = true;
      editorRef.current.setValue(expected);
      internalChangeRef.current = false;
    }
  }, [pipeline]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
