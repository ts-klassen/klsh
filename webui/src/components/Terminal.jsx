import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import 'xterm/css/xterm.css';

/**
 * Very small wrapper around xterm.js that exposes an imperative `.write(data)`
 * method so that other components (e.g. the Runner) can pipe their output to
 * the terminal.
 */

export default function Terminal({ attach }) {
  const termRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    termRef.current = new XTerm({
      fontSize: 14,
      convertEol: true,
      theme: {
        background: '#1e1e1e',
      },
    });
    termRef.current.open(containerRef.current);

    if (typeof attach === 'function') {
      attach(termRef.current);
    }

    return () => {
      termRef.current?.dispose();
    };
  }, [attach]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
