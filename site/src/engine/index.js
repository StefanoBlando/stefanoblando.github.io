import * as THREE from 'three';
import { AmbientLayer } from './ambient-layer.js';
import { Swarm } from './swarm.js';
import { createPostFX } from './postfx.js';
import { pickActiveBlend, readSections } from './sections.js';
import { clampDelta, damp } from './damping.js';


import { palette } from './palette.js';

const smoothstep = (edge0, edge1, x) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

/**
 * A reactive backdrop, not a stage.
 *
 * The document scrolls normally and carries the content; this engine only
 * watches which `[data-shape]` section is nearest the centre of the viewport
 * and morphs the constellation toward that topology. Nothing here is clickable
 * and nothing here holds text — that belongs to the DOM above it.
 */
export class UniverseEngine {
  constructor({ canvas, universe, sectionSelector = '[data-shape]', quality = 'high', onShape } = {}) {
    this.canvas = canvas;
    this.universe = universe;
    this.sectionSelector = sectionSelector;
    this.quality = quality;
    this.onShape = onShape ?? (() => {});

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.time = 0;
    this.weight = 0;
    this.targetWeight = 0;
    this.shape = 0;
    this.scroll = 0;
    this.running = false;
    this.reportedFirstFrame = false;

    this.init();
  }

  init() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, this.quality === 'low' ? 1 : 2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.quality !== 'low',
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
    this.camera.position.set(0, 0, 6.4);

    this.ambient = new AmbientLayer(this.scene, {
      dustCount: this.quality === 'low' ? 600 : 1600,
    });

    // Right of centre on desktop, so section text sits to its left.
    this.bodyCenter = new THREE.Vector3(width >= 900 ? 1.55 : 0, 0.05, 0);

    this.swarm = new Swarm(this.scene, {
      universe: this.universe,
      primary: palette.primary,
      accent: palette.accent,
      count: this.quality === 'low' ? 220 : 350,
      offset: this.bodyCenter,
    });

    this.parallax = new THREE.Vector2();
    this.parallaxTarget = new THREE.Vector2();
    this.orbit = 0;

    // Pointer speed, and the body's own rotation on top of the camera frame.
    this.pointerSpeed = 0;
    this.lastPointer = null;
    this.bodyYaw = 0;
    this.bodyPitch = 0;
    this.bodyOffset = new THREE.Vector3();
    this.bodyEuler = new THREE.Euler(0, 0, 0, 'XYZ');
    this.bodyQuat = new THREE.Quaternion();
    this.cursorLocal = new THREE.Vector3();
    this.cursorNdc = new THREE.Vector2(-10, -10);

    // Scratch colours for the per-scroll tint interpolation.
    this.tintA = new THREE.Color();
    this.tintB = new THREE.Color();

    this.ambient.resize(width / height);
    this.swarm.resize(pixelRatio);

    if (this.quality !== 'low') {
      this.postfx = createPostFX(this.renderer, this.scene, this.camera, {
        width,
        height,
        trails: true,
      });
    }

    this.bindEvents();
    this.readShape();

    this.clock = new THREE.Clock();
    this.running = true;
    requestAnimationFrame(() => this.loop());
  }

  bindEvents() {
    this.onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio, this.quality === 'low' ? 1 : 2);

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.setSize(width, height, false);
      this.ambient.resize(width / height);
      this.swarm.resize(pixelRatio);
      this.postfx?.setSize(width, height);
      this.readShape();
    };

    this.onPointerMove = (event) => {
      const nx = (event.clientX / window.innerWidth - 0.5) * 2;
      const ny = -(event.clientY / window.innerHeight - 0.5) * 2;
      this.parallaxTarget.set(nx, ny);
      this.swarm.setPointer(nx, ny);
      this.cursorNdc.set(nx, ny);

      const px = event.clientX / window.innerWidth;
      const py = event.clientY / window.innerHeight;
      if (this.lastPointer) {
        const moved = Math.hypot(px - this.lastPointer.x, py - this.lastPointer.y);
        this.pointerSpeed = Math.min(0.85, this.pointerSpeed + moved * 3.5);
      }
      this.lastPointer = { x: px, y: py };
    };

    this.onScroll = () => this.readShape();

    // A lost context is a real event on mobile and in long sessions; the page
    // must degrade rather than freeze on a dead canvas.
    this.onContextLost = (event) => {
      event.preventDefault();
      this.running = false;
      this.onShape({ type: 'context-lost' });
    };

    window.addEventListener('resize', this.onResize, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    this.canvas.addEventListener('webglcontextlost', this.onContextLost);
  }

  readShape() {
    const elements = document.querySelectorAll(this.sectionSelector);
    const { from, to, t, weight } = pickActiveBlend(readSections(elements), window.innerHeight);

    // Total progress through the document, which drives the camera orbit.
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    this.scroll = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;

    this.targetWeight = weight;
    this.swarm.setBlend(from, to, t);
    this.applyTint(from, to, t);

    if (from !== this.shape) {
      this.shape = from;
      this.onShape({ type: 'shape', shape: from });
    }
  }

  /**
   * Colour rides the same blend as the topology. Snapping it on a section
   * change while the shape interpolates reads as a cut in a scene that is
   * otherwise continuous.
   */
  applyTint(from, to, t) {
    const tints = palette.tints;
    if (!tints) return;

    const A = tints[from] ?? tints[tints.length - 1];
    const B = tints[to] ?? tints[tints.length - 1];
    if (!A || !B) return;

    const mix = (key) =>
      `#${this.tintA.set(A[key]).lerp(this.tintB.set(B[key]), t).getHexString()}`;

    const primary = mix('primary');
    const accent = mix('accent');
    const smoke = mix('smoke');

    this.swarm.setTint(primary, accent);
    this.ambient.setTint(smoke, accent, primary);
    this.washTarget = smoke;

    // The scrim is an "r, g, b" string consumed by updateScrim, not a hex.
    const a = A.scrim.split(',').map(Number);
    const b = B.scrim.split(',').map(Number);
    this.scrimTarget = a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(', ');
  }

  loop() {
    if (!this.running) return;
    requestAnimationFrame(() => this.loop());

    const dt = clampDelta(this.clock.getDelta());
    if (!this.reducedMotion) this.time += dt;

    // Heavily damped, as in the reference: the scene must not twitch each time
    // a section edge crosses the centre line.
    this.weight = damp(this.weight, this.targetWeight, 1.4, dt);

    // Radial breathing tied to scroll. Normalised, not counted in screens:
    // driving this from scrollY/innerHeight made the breath rate a function of
    // how tall the page happens to be, so a longer page read as a tremor.
    this.swarm.setBreath(1 + Math.sin(this.scroll * Math.PI * 2) * 0.22);

    this.parallax.x = damp(this.parallax.x, this.parallaxTarget.x, 3, dt);
    this.parallax.y = damp(this.parallax.y, this.parallaxTarget.y, 3, dt);

    // The reference's orbit: three quarters of a turn across the whole page,
    // closing in over the first fifth and arcing in elevation on the way.
    this.orbit = damp(this.orbit, this.scroll, 1.8, dt);
    const azimuth = this.orbit * Math.PI * 1.5;
    const elevation = Math.sin(this.orbit * Math.PI) * 0.18;
    const distance = 5.9 - smoothstep(0, 0.22, this.orbit) * 2.6 - this.weight * 0.35;
    const planar = Math.cos(elevation) * distance;

    this.camera.position.set(
      Math.sin(azimuth) * planar + this.parallax.x * 0.3,
      Math.sin(elevation) * distance + this.parallax.y * 0.22,
      Math.cos(azimuth) * planar,
    );
    this.camera.lookAt(0, 0, 0);

    // The body rides in the camera's frame, so it holds the same place on
    // screen while the orbit sweeps the world's dust and smoke past it. With
    // the body fixed in world space instead, the orbit swings it across the
    // view and the composition never settles.
    const grow = 1 + this.orbit * 0.35;
    this.bodyOffset
      .set(this.bodyCenter.x, this.bodyCenter.y, -4.2)
      .applyQuaternion(this.camera.quaternion);
    this.swarm.group.position.copy(this.camera.position).add(this.bodyOffset);

    this.bodyYaw += dt * 0.16 + (this.parallax.x * 0.3 - this.bodyYaw) * dt * 1.4;
    this.bodyPitch = damp(this.bodyPitch, this.parallax.y * 0.18, 2, dt);
    this.bodyEuler.set(this.bodyPitch, this.bodyYaw, 0);
    this.bodyQuat.setFromEuler(this.bodyEuler);
    this.swarm.group.quaternion.copy(this.camera.quaternion).multiply(this.bodyQuat);
    this.swarm.group.scale.setScalar(grow);
    this.swarm.group.updateMatrixWorld();

    // Pointer speed decays on real time, then drives the agitation.
    this.pointerSpeed *= Math.exp(-2.6 * dt);
    this.swarm.setAgitation(this.pointerSpeed);

    // Cursor, brought into the body's own space so the repulsion in the shader
    // matches what the viewer sees under the pointer.
    this.cursorLocal
      .set(this.cursorNdc.x, this.cursorNdc.y, 0.5)
      .unproject(this.camera);
    this.swarm.group.worldToLocal(this.cursorLocal);
    this.swarm.setCursor(this.cursorLocal, 0.55);

    this.ambient.update(this.time, 1 + this.weight * 0.5);
    this.swarm.update(this.time, dt);

    if (this.postfx) this.postfx.render();
    else this.renderer.render(this.scene, this.camera);

    if (!this.reportedFirstFrame) {
      this.reportedFirstFrame = true;
      const c = this.camera.position;
      // Counted from the geometry, not from renderer.info: with a composer,
      // info reflects the last pass rendered — the fullscreen quad — which
      // reports zero points and zero lines however healthy the scene is.
      this.onShape({
        type: 'first-frame',
        lineVertices: this.swarm.lines.geometry.attributes.position.count,
        pointVertices: this.swarm.points.geometry.attributes.position.count,
        lineOpacity: this.swarm.lineMaterial.uniforms.uOpacity.value,
        postfx: !!this.postfx,
        camera: `${c.x.toFixed(2)},${c.y.toFixed(2)},${c.z.toFixed(2)}`,
        lookingAt: `${this.bodyCenter.x},${this.bodyCenter.y},${this.bodyCenter.z}`,
        segments: this.swarm.segmentCount,
        weight: Number(this.weight.toFixed(2)),
      });
    }
  }

  /**
   * The page gradient follows the section too. Without it the scrim stays one
   * colour while everything behind it shifts, and the seam becomes obvious.
   */
  updateScrim(dt) {
    if (!this.scrimTarget) return;

    // The scrim must stay close to the page background. Painting a section's
    // raw colour at high alpha across the text side turns it into a coloured
    // wash over the content; the tint should only inflect the dark, not replace
    // it. A fifth of the way toward the section colour is enough to register.
    if (!this.inkRgb) {
      const n = parseInt(palette.ink.slice(1), 16);
      this.inkRgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    const raw = this.scrimTarget.split(',').map(Number);
    const target = raw.map((v, i) => this.inkRgb[i] + (v - this.inkRgb[i]) * 0.2);
    if (!this.scrimCurrent) this.scrimCurrent = target.slice();

    const k = 1 - Math.exp(-1.6 * dt);
    let moved = 0;
    for (let i = 0; i < 3; i += 1) {
      const next = this.scrimCurrent[i] + (target[i] - this.scrimCurrent[i]) * k;
      moved += Math.abs(next - this.scrimCurrent[i]);
      this.scrimCurrent[i] = next;
    }

    // Only touch the DOM when the value has actually moved.
    if (moved > 0.01) {
      document.documentElement.style.setProperty(
        '--scrim-rgb',
        this.scrimCurrent.map((v) => Math.round(v)).join(', '),
      );
    }

    this.updateWash(dt);
  }

  /** The background wash carries the section colour at full strength. */
  updateWash(dt) {
    if (!this.washTarget) return;
    const n = parseInt(this.washTarget.slice(1), 16);
    const target = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    if (!this.washCurrent) this.washCurrent = target.slice();

    const k = 1 - Math.exp(-1.6 * dt);
    let moved = 0;
    for (let i = 0; i < 3; i += 1) {
      const next = this.washCurrent[i] + (target[i] - this.washCurrent[i]) * k;
      moved += Math.abs(next - this.washCurrent[i]);
      this.washCurrent[i] = next;
    }

    if (moved > 0.01) {
      document.documentElement.style.setProperty(
        '--wash-rgb',
        this.washCurrent.map((v) => Math.round(v)).join(', '),
      );
    }
  }

  dispose() {
    this.running = false;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    this.ambient.dispose();
    this.postfx?.dispose();
    this.renderer.dispose();
  }
}
