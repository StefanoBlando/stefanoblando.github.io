/**
 * Ships browser-side failures to the dev server log.
 *
 * Shader compilation errors and constructor throws are invisible from the
 * terminal, which makes a black canvas indistinguishable from a dead one. This
 * is development instrumentation, not part of the engine.
 */
const ENDPOINT = '/__diag';

const queue = [];
let flushing = false;

function flush() {
  if (flushing || queue.length === 0) return;
  flushing = true;
  setTimeout(() => {
    flushing = false;
    const body = JSON.stringify(queue.splice(0, queue.length), null, 2);
    try {
      if (!navigator.sendBeacon(ENDPOINT, body)) throw new Error('beacon refused');
    } catch {
      fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  }, 150);
}

export function report(entry) {
  queue.push({ at: new Date().toISOString().slice(11, 19), ...entry });
  flush();
}

export function installDiagnostics() {
  window.addEventListener('error', (event) => {
    report({
      kind: 'window.error',
      message: event.message,
      where: `${event.filename}:${event.lineno}:${event.colno}`,
      stack: event.error?.stack?.split('\n').slice(0, 6).join(' | '),
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    report({
      kind: 'unhandledrejection',
      message: String(event.reason?.message ?? event.reason),
      stack: event.reason?.stack?.split('\n').slice(0, 6).join(' | '),
    });
  });

  // Three.js reports shader compilation failures through console.error.
  const original = console.error;
  console.error = (...args) => {
    report({
      kind: 'console.error',
      message: args
        .map((a) => (typeof a === 'string' ? a : String(a)))
        .join(' ')
        .slice(0, 6000),
    });
    original.apply(console, args);
  };
}

export function reportEnvironment(canvas, universe) {
  let webgl2 = false;
  let renderer = 'unknown';
  try {
    const probe = document.createElement('canvas').getContext('webgl2');
    webgl2 = !!probe;
    const info = probe?.getExtension('WEBGL_debug_renderer_info');
    if (info) renderer = probe.getParameter(info.UNMASKED_RENDERER_WEBGL);
  } catch (error) {
    renderer = `probe failed: ${error.message}`;
  }

  report({
    kind: 'environment',
    webgl2,
    renderer,
    dpr: window.devicePixelRatio,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    canvasBox: canvas ? `${canvas.clientWidth}x${canvas.clientHeight}` : 'no canvas',
    clusters: universe.clusters.length,
    nodes: universe.nodes.length,
  });
}
