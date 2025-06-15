/**
 * Convert React-Flow graph → Pipeline JSON (supports linear chains only).
 */

export default function flow2json({ nodes }) {
  if (!nodes || !nodes.length) return [];

  const sorted = [...nodes].sort((a, b) => a.position.x - b.position.x);

  const cmdObjects = sorted.map((node) => ({
    component: [
      { type: 'text', value: typeof node.data?.label === 'string' ? node.data.label : 'cmd' },
    ],
    params: [],
    redirect: [],
  }));

  for (let i = 0; i < cmdObjects.length - 1; i++) {
    cmdObjects[i].pipe = cmdObjects[i + 1];
  }

  return [cmdObjects[0]];
}
