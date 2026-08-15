import * as THREE from 'three';
import { damp } from './damping.js';
import { buildStructure } from './structure.js';

/**
 * The constellation: the site's own structure, drawn.
 *
 * Particles belong to real works and the edges are real relationships — same
 * work, or a shared research topic. Layouts reposition the works; the wiring
 * never changes, so a morph redraws the same relationships from a new angle.
 *
 * The morph runs on the CPU and rewrites both buffers each frame. At this size
 * that is about twelve thousand floats, well under a millisecond, and it is
 * what the reference does too. The earlier objection to CPU line updates was
 * about far denser fields, where it does not hold.
 *
 * Points and lines share one GLSL `drift()`, evaluated on the GPU. Because it
 * is a pure function of base position and time, line endpoints stay welded to
 * their points with no per-frame CPU work.
 */

/**
 * The morph damping is only a jitter filter now. The target itself is driven
 * by scroll position, so a slow rate here would reintroduce exactly the lag
 * the blend was written to remove — the cloud would trail the page instead of
 * moving with it.
 */
const MORPH_RATE = 8;

/**
 * Low spatial frequencies on purpose: neighbours receive nearly the same phase,
 * so a region swells and subsides as one body. High frequencies here read as
 * incoherent shimmer — mechanical rather than alive.
 */
const DRIFT = /* glsl */ `
  uniform float uAgitation;
  uniform vec3 uCursor;
  uniform float uRepel;

  vec3 drift(vec3 p, float t) {
    vec3 slow = vec3(
      sin(t * 0.23 + p.x * 0.19 + p.y * 0.12),
      cos(t * 0.18 + p.y * 0.16 + p.z * 0.14),
      sin(t * 0.21 + p.z * 0.15 + p.x * 0.10)
    );
    vec3 fine = vec3(
      sin(t * 0.80 + p.y * 1.05),
      cos(t * 0.74 + p.z * 0.95),
      sin(t * 0.78 + p.x * 0.88)
    );
    // Pointer speed agitates the fine term: the cloud gets restless when you
    // move quickly and settles when you stop.
    vec3 moved = p + slow * 0.085 + fine * (0.014 + uAgitation * 0.05);

    // Push away from the cursor. Applied inside drift so points and threads
    // displace identically and the wiring stays welded.
    vec3 away = moved - uCursor;
    float reach = length(away);
    float push = smoothstep(0.85, 0.0, reach) * uRepel;
    return moved + normalize(away + 1e-5) * push * 0.4;
  }
`;

/** Fades points that pass very close to the camera, so entering never blinds. */
const NEAR_FADE = /* glsl */ `
  float nearFade(float depth) {
    return smoothstep(0.12, 0.75, depth);
  }
`;

const POINT_VERT = /* glsl */ `
  ${DRIFT}
  ${NEAR_FADE}
  attribute float aScale;
  attribute float aTint;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uTeal;
  uniform vec3 uGold;
  varying vec3 vColor;
  varying float vFade;

  void main() {
    vec3 pos = drift(position, uTime);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float depth = max(-mv.z, 0.001);
    // Constant screen size, as in the reference: the constellation reads as a
    // drawn figure rather than as objects receding into depth.
    gl_PointSize = aScale * uPixelRatio * 4.5;
    vColor = mix(uTeal, uGold, aTint);
    vFade = smoothstep(26.0, 2.0, depth) * nearFade(depth);
    gl_Position = projectionMatrix * mv;
  }
`;

const POINT_FRAG = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.03, d);
    gl_FragColor = vec4(vColor, alpha * vFade * 0.9);
  }
`;

const LINE_VERT = /* glsl */ `
  ${DRIFT}
  ${NEAR_FADE}
  attribute float aStrength;
  uniform float uTime;
  varying float vFade;
  varying float vStrength;
  void main() {
    vec3 pos = drift(position, uTime);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float depth = max(-mv.z, 0.001);
    vFade = smoothstep(32.0, 2.5, depth) * nearFade(depth);
    vStrength = aStrength;
    gl_Position = projectionMatrix * mv;
  }
`;

const LINE_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  varying float vStrength;
  void main() {
    // Uniform and quiet, as in the reference: the threads are a whisper that
    // implies the network. Accent colours and per-edge emphasis turned them
    // into a diagram competing with the cloud.
    gl_FragColor = vec4(uColor, uOpacity * vFade * vStrength);
  }
`;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Swarm {
  constructor(scene, { universe, primary, accent, count, offset }) {
    this.group = new THREE.Group();
    this.group.position.copy(offset);
    scene.add(this.group);

    this.count = count;
    this.pointer = new THREE.Vector2();
    this.pointerTarget = new THREE.Vector2();
    this.breath = 1;
    this.breathTarget = 1;
    this.tintPrimary = new THREE.Color(primary);
    this.tintAccent = new THREE.Color(accent);
    this.tintTargetPrimary = new THREE.Color(primary);
    this.tintTargetAccent = new THREE.Color(accent);

    this.structure = buildStructure(universe, count);
    this.layouts = this.structure.layouts;

    this.current = Float32Array.from(this.layouts[0]);
    this.target = Float32Array.from(this.layouts[0]);

    this.buildPoints({ primary, accent });
    this.buildLines({ primary });
  }

  buildPoints({ primary, accent }) {
    const rand = mulberry32(0x51ed3);
    const scales = new Float32Array(this.count);
    const tints = new Float32Array(this.count);

    for (let i = 0; i < this.count; i += 1) {
      scales[i] = 0.55 + rand() * 1.25;
      tints[i] = rand() < 0.22 ? 0.8 + rand() * 0.2 : rand() * 0.18;
    }

    const geometry = new THREE.BufferGeometry();
    this.pointAttribute = new THREE.BufferAttribute(this.current, 3);
    this.pointAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', this.pointAttribute);
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aTint', new THREE.BufferAttribute(tints, 1));

    this.pointMaterial = new THREE.ShaderMaterial({
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uTeal: { value: new THREE.Color(primary) },
        uGold: { value: new THREE.Color(accent) },
        uAgitation: { value: 0 },
        uCursor: { value: new THREE.Vector3(999, 999, 999) },
        uRepel: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geometry, this.pointMaterial);
    this.points.frustumCulled = false;
    this.group.add(this.points);
  }

  buildLines({ primary }) {
    this.pairs = this.structure.pairs;
    const edgeCount = this.pairs.length / 2;

    this.linePositions = new Float32Array(this.pairs.length * 3);

    const geometry = new THREE.BufferGeometry();
    this.lineAttribute = new THREE.BufferAttribute(this.linePositions, 3);
    this.lineAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', this.lineAttribute);
    geometry.setAttribute('aStrength', new THREE.BufferAttribute(this.structure.strengths, 1));

    this.lineMaterial = new THREE.ShaderMaterial({
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(primary) },
        uAgitation: { value: 0 },
        uCursor: { value: new THREE.Vector3(999, 999, 999) },
        uRepel: { value: 0 },
        // A whisper. The reference sits at 0.06; this is a touch higher only
        // because the finishing pass lifts contrast and crushes faint values.
        uOpacity: { value: 0.3 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.lines = new THREE.LineSegments(geometry, this.lineMaterial);
    this.lines.frustumCulled = false;
    this.group.add(this.lines);
    this.segmentCount = edgeCount;
  }

  /**
   * Positions the cloud between two layouts. `t` is where the document sits
   * between them, so the morph is driven by scroll rather than by a timer.
   */
  setBlend(from, to, t) {
    const last = this.layouts.length - 1;
    const A = this.layouts[Math.max(0, Math.min(last, from))];
    const B = this.layouts[Math.max(0, Math.min(last, to))];

    // Consecutive bands sharing a shape land here, and the topology holds
    // perfectly still for the length of both.
    if (A === B) {
      this.target.set(A);
      return;
    }
    for (let i = 0; i < this.target.length; i += 1) {
      this.target[i] = A[i] + (B[i] - A[i]) * t;
    }
  }

  /** Pointer speed, 0..1: how restless the fine noise becomes. */
  setAgitation(value) {
    this.pointMaterial.uniforms.uAgitation.value = value;
    this.lineMaterial.uniforms.uAgitation.value = value;
  }

  /** Cursor in the body's local space, with the strength of its push. */
  setCursor(localPoint, strength) {
    this.pointMaterial.uniforms.uCursor.value.copy(localPoint);
    this.lineMaterial.uniforms.uCursor.value.copy(localPoint);
    this.pointMaterial.uniforms.uRepel.value = strength;
    this.lineMaterial.uniforms.uRepel.value = strength;
  }

  /** Retints threads and points toward a section's pair. */
  setTint(primary, accent) {
    this.tintTargetPrimary.set(primary);
    this.tintTargetAccent.set(accent);
  }

  /** Scroll-driven radial swell: the body expands and contracts as you move. */
  setBreath(value) {
    this.breathTarget = value;
  }

  setPointer(nx, ny) {
    this.pointerTarget.set(nx, ny);
  }

  resize(pixelRatio) {
    this.pointMaterial.uniforms.uPixelRatio.value = pixelRatio;
  }

  update(time, dt) {
    this.pointMaterial.uniforms.uTime.value = time;
    this.lineMaterial.uniforms.uTime.value = time;

    // Colour damps like everything else, so a fast scroll glides through the
    // shift instead of cutting between two palettes.
    const k = 1 - Math.exp(-1.6 * dt);
    this.tintPrimary.lerp(this.tintTargetPrimary, k);
    this.tintAccent.lerp(this.tintTargetAccent, k);
    this.pointMaterial.uniforms.uTeal.value.copy(this.tintPrimary);
    this.pointMaterial.uniforms.uGold.value.copy(this.tintAccent);
    this.lineMaterial.uniforms.uColor.value.copy(this.tintPrimary);

    this.breath = damp(this.breath, this.breathTarget, 1.2, dt);
    for (let i = 0; i < this.current.length; i += 1) {
      this.current[i] = damp(this.current[i], this.target[i] * this.breath, MORPH_RATE, dt);
    }
    this.pointAttribute.needsUpdate = true;

    for (let k = 0; k < this.pairs.length; k += 1) {
      const p = this.pairs[k] * 3;
      this.linePositions[k * 3] = this.current[p];
      this.linePositions[k * 3 + 1] = this.current[p + 1];
      this.linePositions[k * 3 + 2] = this.current[p + 2];
    }
    this.lineAttribute.needsUpdate = true;

    this.pointer.x = damp(this.pointer.x, this.pointerTarget.x, 2.2, dt);
    this.pointer.y = damp(this.pointer.y, this.pointerTarget.y, 2.2, dt);
  }
}
