/**
 * Convert Pipeline JSON → React-Flow nodes + edges (linear chains only).
 */

export default function json2flow(pipelineJSON) {
  const nodes = [];
  const edges = [];

  let cmd = pipelineJSON?.[0];
  let idx = 0;
  while (cmd) {
    const id = String(idx);
    const label = Array.isArray(cmd.component)
      ? cmd.component.map((t) => t.value).join('')
      : 'cmd';

    nodes.push({ id, data: { label }, position: { x: idx * 200, y: 0 } });

    if (cmd.pipe) {
      const nextId = String(idx + 1);
      edges.push({ id: `${id}-${nextId}`, source: id, target: nextId });
    }

    cmd = cmd.pipe;
    idx += 1;
  }

  return { nodes, edges };
}
