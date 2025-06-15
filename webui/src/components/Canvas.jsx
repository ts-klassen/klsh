import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';

import 'react-flow-renderer/dist/style.css';
import 'react-flow-renderer/dist/theme-default.css';

import { usePipelineStore } from '../store/pipeline.jsx';
import json2flow from '../util/json2flow.js';
import flow2json from '../util/flow2json.js';
// Ensure .js extension still correct.

/**
 * Canvas – visual drag-and-drop builder backed by React-Flow.
 *
 * The component translates the canonical Pipeline JSON stored in the Zustand
 * store into React-Flow's `nodes` + `edges` structures for display. Any
 * interaction that mutates the graph is converted back into a fresh Pipeline
 * JSON object and written to the store.  This guarantees that the Canvas and
 * the TextEditor stay perfectly in sync.
 */

export default function Canvas() {
  // ---------------------------------------------------------------------
  // 1. Subscribe to the pipeline JSON.
  // ---------------------------------------------------------------------

  const pipeline = usePipelineStore((s) => s.pipeline);
  const setPipeline = usePipelineStore((s) => s.setPipeline);

  // ---------------------------------------------------------------------
  // 2. Convert JSON → Flow nodes/edges (memoised for performance).
  // ---------------------------------------------------------------------

  const initial = useMemo(() => json2flow(pipeline), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  // keep nodes/edges in sync with pipeline updates from editor
  useEffect(() => {
    const { nodes: nextNodes, edges: nextEdges } = json2flow(pipeline);
    // eslint-disable-next-line no-console
    console.log('[Canvas] Pipeline updated:', pipeline);
    // eslint-disable-next-line no-console
    console.log('[Canvas] New nodes/edges:', nextNodes, nextEdges);
    setNodes(nextNodes);
    setEdges(nextEdges);
  }, [pipeline, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
      const json = flow2json({ nodes, edges: addEdge(params, edges) });
      setPipeline(json);
    },
    [nodes, edges, setPipeline]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      style={{ width: '100%', height: '100%' }}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
}
