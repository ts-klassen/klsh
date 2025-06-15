/**
 * Convert Pipeline JSON → React-Flow nodes + edges (linear chains only).
 */

export default function json2flow(pipelineJSON) {
  const nodes = [];
  const edges = [];

  if (!Array.isArray(pipelineJSON) || pipelineJSON.length === 0) {
    return { nodes, edges };
  }

  // Multiple top-level pipelines (separated by ';') are laid out in rows.
  let globalIdx = 0;
  pipelineJSON.forEach((rootCmd, rowIdx) => {
    let cmd = rootCmd;
    let colIdx = 0;
    while (cmd) {
      const id = String(globalIdx);
      const label = Array.isArray(cmd.component)
        ? cmd.component.map((t) => t.value).join('')
        : 'cmd';

      nodes.push({ id, data: { label }, position: { x: colIdx * 200, y: rowIdx * 120 } });

      if (cmd.pipe) {
        const nextId = String(globalIdx + 1);
        edges.push({ id: `${id}-${nextId}`, source: id, target: nextId });
      }

      cmd = cmd.pipe;
      colIdx += 1;
      globalIdx += 1;
    }
    // Add a small gap between separate pipelines
    globalIdx += 1;
  });

  return { nodes, edges };
}
