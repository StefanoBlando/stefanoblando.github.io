import * as THREE from 'three';
import { AmbientLayer } from './ambient-layer.js';
import { Swarm } from './swarm.js';
import { createPostFX } from './postfx.js';
import { pickActiveBlend, readSections } from './sections.js';
import { buildJourney, interpolateStops } from './journey.js';
import { clampDelta, damp } from './damping.js';


import { palette } from './palette.js';

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

/**
 * A journey through one place.
 *
 * The field is fixed in world space and the camera travels between authored
 * stations, one per `[data-shape]` section. Scroll decides where between two
 * stations the camera sits; the same curve carries the colour.
 *
 * Nothing here is clickable and nothing here holds text — the stations'
 * titles and links live in the DOM above it.
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

    // The field is a place: it sits at the origin and stays there. Earlier
    // builds welded it to the camera so it held its spot on screen, which is
    // incompatible with travelling — the destination would move with you.
    this.swarm = new Swarm(this.scene, {
      universe: this.universe,
      primary: palette.primary,
      accent: palette.accent,
      count: this.quality === 'low' ? 220 : 350,
      offset: new THREE.Vector3(0, 0, 0),
    });

    this.parallax = new THREE.Vector2();
    this.parallaxTarget = new THREE.Vector2();

    // The walk through the graph, and where the camera currently is on it.
    // Built from the same universe the page rendered its stops from, so the
    // two cannot disagree about where stop N is.
    this.journey = buildJourney(this.universe);
    this.waypoint = { from: 0, to: 0, t: 0 };
    this.camDesired = new THREE.Vector3(...this.journey[0].position);
    this.camLookDesired = new THREE.Vector3(...this.journey[0].target);
    this.camPos = this.camDesired.clone();
    this.camLook = this.camLookDesired.clone();

    // How lit each work is. Works already passed keep an ember; the one being
    // arrived at burns full. Damped per frame so nothing switches on abruptly.
    this.glow = new Float32Array(this.universe.nodes.length);
    this.glowTarget = new Float32Array(this.universe.nodes.length);

    this.pointerSpeed = 0;
    this.lastPointer = null;
    // The body turns slowly on its own, so a station is never quite static.
    this.bodyYaw = 0;
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

    // Total progress through the document, which drives the radial breath.
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    this.scroll = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;

    this.targetWeight = weight;
    this.waypoint = { from, to, t };
    this.applyTint(from, to, t);
    this.aimGlow(from, to, t);

    if (from !== this.shape) {
      this.shape = from;
      this.onShape({ type: 'shape', shape: from });
    }
  }

  /**
   * Lights the road behind you and the node you are arriving at.
   *
   * Everything the journey has already passed keeps a low ember, so the path
   * reads as travelled rather than as a series of unrelated flashes. The stop
   * being approached comes up on the same curve as the camera, so the light
   * arrives exactly when you do.
   */
  aimGlow(from, to, t) {
    const EMBER = 0.28;
    this.glowTarget.fill(0);

    for (let i = 0; i <= from; i += 1) {
      const work = this.journey[i]?.work;
      if (work != null) this.glowTarget[work] = Math.max(this.glowTarget[work], EMBER);
    }

    const arriving = this.journey[to]?.work;
    if (arriving != null) {
      this.glowTarget[arriving] = Math.max(this.glowTarget[arriving], EMBER + (1 - EMBER) * t);
    }

    // A destination burns brighter than a stop you merely travelled through.
    const here = this.journey[from];
    if (here?.work != null && here.kind === 'destination') {
      this.glowTarget[here.work] = Math.max(this.glowTarget[here.work], 1);
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

    // Stops share a tint within a leg, so the colour changes on arrival rather
    // than on every screen of travelling.
    const zoneOf = (i) => this.journey[i]?.tint ?? 0;
    const A = tints[zoneOf(from)] ?? tints[tints.length - 1];
    const B = tints[zoneOf(to)] ?? tints[tints.length - 1];
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

    // The camera travels between authored stations. The scroll curve decides
    // where between two it sits; the damping only smooths a fast scroll into
    // a glide, it does not decide the destination.
    const shot = interpolateStops(this.journey, this.waypoint.from, this.waypoint.to, this.waypoint.t);
    this.camDesired.set(shot.position[0], shot.position[1], shot.position[2]);
    this.camLookDesired.set(shot.target[0], shot.target[1], shot.target[2]);

    this.camPos.x = damp(this.camPos.x, this.camDesired.x + this.parallax.x * 0.22, 3.2, dt);
    this.camPos.y = damp(this.camPos.y, this.camDesired.y + this.parallax.y * 0.18, 3.2, dt);
    this.camPos.z = damp(this.camPos.z, this.camDesired.z, 3.2, dt);
    this.camLook.x = damp(this.camLook.x, this.camLookDesired.x, 3.2, dt);
    this.camLook.y = damp(this.camLook.y, this.camLookDesired.y, 3.2, dt);
    this.camLook.z = damp(this.camLook.z, this.camLookDesired.z, 3.2, dt);

    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    // The field stays where it is and turns slowly on its own, so a station is
    // never quite static without the camera having to move.
    this.bodyYaw += dt * 0.05;
    this.swarm.group.rotation.set(0, this.bodyYaw, 0);
    this.swarm.group.updateMatrixWorld();

    // The light follows the camera rather than snapping with the scroll event.
    for (let i = 0; i < this.glow.length; i += 1) {
      this.glow[i] = damp(this.glow[i], this.glowTarget[i], 2.6, dt);
    }
    this.swarm.setGlow(this.glow);

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
        lookingAt: `${this.camLook.x.toFixed(2)},${this.camLook.y.toFixed(2)},${this.camLook.z.toFixed(2)}`,
        station: `${this.waypoint.from}->${this.waypoint.to} t=${this.waypoint.t.toFixed(2)}`,
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
