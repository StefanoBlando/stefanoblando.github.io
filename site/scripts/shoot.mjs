/**
 * Screenshots the homepage at each station, over the DevTools protocol.
 *
 * The waypoints are compositions, and there is no way to reason about whether
 * one is framed well — the only instrument is looking at it. This renders all
 * eight so they can be compared side by side after a change.
 *
 * Node 24 has a global WebSocket, so this needs no dependency.
 *
 * Start a browser first:
 *   chrome-headless-shell --no-sandbox --use-gl=angle --use-angle=swiftshader \
 *     --enable-unsafe-swiftshader --remote-debugging-port=9222 about:blank
 *
 * Then:  node scripts/shoot.mjs [url] [outdir]
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const URL_ = process.argv[2] ?? 'http://localhost:4321/';
const OUT = process.argv[3] ?? 'shots';
mkdirSync(OUT, { recursive: true });

const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const target = targets.find((t) => t.type === 'page');
if (!target) throw new Error('no page target — is chrome running with --remote-debugging-port=9222?');

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => (ws.onopen = resolve));

let id = 0;
const pending = new Map();
const errors = [];

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
    errors.push(msg.params.entry.text);
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    errors.push(msg.params.exceptionDetails.exception?.description ?? 'exception');
  }
  if (!msg.id || !pending.has(msg.id)) return;
  const { resolve, reject } = pending.get(msg.id);
  pending.delete(msg.id);
  msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
};

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });

const evaluate = async (expression) =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result
    .value;

const settle = (ms) => evaluate(`new Promise((r) => setTimeout(r, ${ms}))`);

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send('Page.navigate', { url: URL_ });
await settle(4000);

const scene = await evaluate('document.body.dataset.scene');
console.log(`scene: ${scene}`);

const stations = await evaluate(`
  [...document.querySelectorAll('[data-shape]')].map((el) => ({
    shape: el.dataset.shape,
    label: (el.querySelector('h1, h2')?.textContent ?? '').trim().slice(0, 24),
    centre: Math.round(el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2),
  }))
`);

for (const station of stations) {
  await evaluate(`window.scrollTo(0, ${station.centre})`);
  // Long enough for the camera damping to arrive: the framing is the thing
  // being judged, and a shot taken mid-flight judges the wrong picture.
  await settle(2400);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  const name = `${OUT}/station-${station.shape}.png`;
  writeFileSync(name, Buffer.from(data, 'base64'));
  console.log(`${name}  y=${station.centre}  "${station.label}"`);
}

if (errors.length) {
  console.log('\nconsole errors:');
  for (const e of errors.slice(0, 8)) console.log('  ' + e);
} else {
  console.log('\nno console errors');
}

ws.close();
