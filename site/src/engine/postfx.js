import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

/**
 * Two-composer pipeline, following the FPlus reference.
 *
 * The fluid quality does not come from how the particles move — it comes from
 * rendering the dust on its own layer through an AfterimagePass, so every mote
 * leaves a decaying trail. That trail texture is then mixed additively into the
 * main image. Without it the same particles read as dry specks.
 *
 * The main chain is render -> bloom -> a finishing pass that adds the trails,
 * a slight RGB split, a contrast lift and film grain.
 */

/** Dust lives on this layer so it can be rendered separately for trails. */
export const TRAIL_LAYER = 1;

const FINISH_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    tParticles: { value: null },
    uPartMix: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tParticles;
    uniform float uPartMix;
    varying vec2 vUv;

    float rand(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // The composer's targets are linear. Writing them straight to an sRGB
    // screen renders everything far darker than intended — bright points
    // survive it, faint threads do not. OutputPass normally does this; this
    // chain ends on its own pass, so it has to do it here.
    vec3 linearToSRGB(vec3 c) {
      return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
                 step(vec3(0.0031308), c));
    }

    void main() {
      vec2 uv = vUv;
      vec2 d = uv - 0.5;

      // Chromatic aberration, growing toward the edges of the frame.
      float ca = 0.0016;
      vec3 col;
      col.r = texture2D(tDiffuse, uv - d * ca).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv + d * ca).b;

      col += texture2D(tParticles, uv).rgb * uPartMix;
      // Contrast lifted around a low pivot. Pivoting at 0.5 crushed everything
      // dimmer than mid grey to black, which erased the whole thread web.
      col = (col - 0.28) * 1.15 + 0.28;

      col = linearToSRGB(col);

      // Grain, which also breaks up banding across the dark field. Applied
      // after encoding, so it stays an even film rather than crushing in shadow.
      col += (rand(gl_FragCoord.xy) - 0.5) * 0.0063;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export function createPostFX(renderer, scene, camera, { width, height, trails = true }) {
  const size = new THREE.Vector2(width, height);

  // Trail composer: dust only, accumulating into its own target.
  let trailComposer = null;
  let trailCamera = null;
  let placeholder = null;

  if (trails) {
    trailCamera = camera.clone();
    trailCamera.layers.set(TRAIL_LAYER);

    trailComposer = new EffectComposer(renderer);
    trailComposer.addPass(new RenderPass(scene, trailCamera, undefined, new THREE.Color(0, 0, 0), 1));
    trailComposer.addPass(new AfterimagePass(0.82));
    trailComposer.renderToScreen = false;
    trailComposer.setSize(width, height);
  }

  // Stand-in until the first trail frame exists, and the permanent source when
  // trails are disabled.
  placeholder = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  placeholder.needsUpdate = true;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(size, 0.9, 0.72, 0.85);
  composer.addPass(bloom);

  const finish = new ShaderPass(FINISH_SHADER);
  finish.uniforms.tParticles.value = placeholder;
  finish.uniforms.uPartMix.value = trails ? 1 : 0;
  finish.renderToScreen = true;
  composer.addPass(finish);
  composer.setSize(width, height);

  return {
    composer,
    bloom,
    setSize(w, h) {
      composer.setSize(w, h);
      bloom.setSize(w, h);
      trailComposer?.setSize(w, h);
    },
    render() {
      if (trailComposer && trailCamera) {
        // The trail camera shadows the main one; only its layer mask differs.
        trailCamera.position.copy(camera.position);
        trailCamera.quaternion.copy(camera.quaternion);
        trailCamera.fov = camera.fov;
        trailCamera.aspect = camera.aspect;
        trailCamera.updateProjectionMatrix();
        trailComposer.render();
        // EffectComposer ping-pongs its two targets, so the current output must
        // be read fresh each frame; a fixed reference flickers on alternate frames.
        finish.uniforms.tParticles.value = trailComposer.readBuffer.texture;
      }
      composer.render();
    },
    dispose() {
      composer.dispose();
      trailComposer?.dispose();
      placeholder?.dispose();
    },
  };
}
