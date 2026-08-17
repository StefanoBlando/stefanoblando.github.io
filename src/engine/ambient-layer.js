import * as THREE from 'three';
import { TRAIL_LAYER } from './postfx.js';
import { palette } from './palette.js';

/**
 * Atmosphere, following the FPlus reference closely.
 *
 * Two parts:
 *   - a domain-warped smoke plane, deliberately faint (amplitude 0.12): it is a
 *     veil, not a subject, and it zooms with the camera so it never slides
 *     independently of the constellation;
 *   - a dense volumetric dust field on its own layer.
 *
 * The dust is invisible to the main camera on purpose. It is rendered only by
 * the trail composer, which accumulates it through an AfterimagePass, and the
 * result is mixed back in. That accumulation — not the particle motion — is
 * what produces the liquid quality.
 */

const SMOKE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const SMOKE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform vec3 uTeal;
  uniform vec3 uGold;
  uniform float uAmp;
  uniform float uZoom;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x),
               mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p = p * 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    vec2 ctr = vec2(0.5 * uAspect, 0.5);
    vec2 uv = (ctr + (p - ctr) / uZoom) * 2.4;

    float t = uTime * 0.045;

    // Two rounds of domain warping produce the slow curling volutes.
    vec2 q = vec2(fbm(uv + vec2(0.0, t * 1.3)), fbm(uv + vec2(5.2, -t)));
    vec2 r = vec2(fbm(uv + 2.0 * q + vec2(1.7, 9.2) + t * 0.4),
                  fbm(uv + 2.0 * q + vec2(8.3, 2.8) - t * 0.3));
    float f = fbm(uv + 2.2 * r);
    f = smoothstep(0.12, 0.95, f);

    vec3 col = uTeal * f + uGold * smoothstep(0.72, 1.0, f) * 0.5;
    gl_FragColor = vec4(col * uAmp, 1.0);
  }
`;

export class AmbientLayer {
  constructor(scene, { dustCount }) {
    this.scene = scene;

    this.smokeMaterial = new THREE.ShaderMaterial({
      vertexShader: SMOKE_VERT,
      fragmentShader: SMOKE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uTeal: { value: new THREE.Color(palette.smoke) },
        uGold: { value: new THREE.Color(palette.accent) },
        uAmp: { value: 0.12 },
        uZoom: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    this.smoke = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.smokeMaterial);
    this.smoke.frustumCulled = false;
    this.smoke.renderOrder = -1;
    scene.add(this.smoke);

    this.tintSmoke = new THREE.Color(palette.smoke);
    this.tintTargetSmoke = new THREE.Color(palette.smoke);
    this.tintAccent = new THREE.Color(palette.accent);
    this.tintTargetAccent = new THREE.Color(palette.accent);
    this.tintDust = new THREE.Color('#ffffff');
    this.tintTargetDust = new THREE.Color('#ffffff');

    this.buildDust(scene, dustCount);
  }

  buildDust(scene, dustCount) {
    const positions = new Float32Array(dustCount * 3);
    const colors = new Float32Array(dustCount * 3);

    const teal = new THREE.Color(palette.primary);
    const gold = new THREE.Color(palette.accent);
    const pale = new THREE.Color(palette.pale);

    for (let i = 0; i < dustCount; i += 1) {
      // A generous shell around the body, so motes stream past on the way in.
      const radius = 1.4 + Math.random() * 7.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const roll = Math.random();
      const c = roll < 0.33 ? gold : roll < 0.66 ? teal : pale;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.dustMaterial = new THREE.PointsMaterial({
      size: 0.095,
      map: this.dotTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    this.dust = new THREE.Points(geometry, this.dustMaterial);
    this.dust.frustumCulled = false;
    // Only the trail camera sees this; it reaches the screen through the mix.
    this.dust.layers.set(TRAIL_LAYER);
    scene.add(this.dust);
  }

  dotTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.85)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  /** Smoke and dust follow the active section, like the constellation. */
  setTint(smoke, accent, dust) {
    this.tintTargetSmoke.set(smoke);
    this.tintTargetAccent.set(accent);
    this.tintTargetDust.set(dust);
  }

  resize(aspect) {
    this.smokeMaterial.uniforms.uAspect.value = aspect;
  }

  update(time, zoom, dt = 0.016) {
    this.smokeMaterial.uniforms.uTime.value = time;
    this.smokeMaterial.uniforms.uZoom.value = zoom;
    this.dust.rotation.y = time * 0.012;

    const k = 1 - Math.exp(-1.6 * dt);
    this.tintSmoke.lerp(this.tintTargetSmoke, k);
    this.tintAccent.lerp(this.tintTargetAccent, k);
    this.tintDust.lerp(this.tintTargetDust, k);

    this.smokeMaterial.uniforms.uTeal.value.copy(this.tintSmoke);
    this.smokeMaterial.uniforms.uGold.value.copy(this.tintAccent);
    // PointsMaterial.color multiplies the per-particle colours, so this shifts
    // the whole dust field without rebuilding its buffer.
    this.dustMaterial.color.copy(this.tintDust);
  }

  dispose() {
    this.smoke.geometry.dispose();
    this.smokeMaterial.dispose();
    this.dust.geometry.dispose();
    this.dustMaterial.dispose();
  }
}
