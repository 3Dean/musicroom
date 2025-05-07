import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const gltfLoader = new GLTFLoader();
const scene = window.scene;
const camera = window.camera;
const renderer = window.renderer;

// --- Load your sprite sheet texture ---
const texture = new THREE.TextureLoader().load('/images/vaporsprite4x4.png');
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

// --- Set the number of frames ---
const tilesHoriz = 2; // Number of columns in sprite sheet (quadrants)
const tilesVert = 2;  // Number of rows
const totalFrames = 4; // Only 4 quadrant frames

// --- Particle geometry ---
const geometry = new THREE.BufferGeometry();
const count = 2;

const positions = new Float32Array(count * 3);
const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Single particle at model center, random frame start
      positions.set([0, 0, 0], i * 3);
      offsets[i] = Math.random() * totalFrames;
    }

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 1));

// --- Shader material ---
const material = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    map: { value: texture },
    time: { value: 0 },
    tilesHoriz: { value: tilesHoriz },
    tilesVert: { value: tilesVert },
    totalFrames: { value: totalFrames },
  },
  vertexShader: `
    attribute float offset;
    varying vec2 vFrameOffset;
    varying vec2 vFrameScale;
    varying float vPhase;
    uniform float time;
    uniform float tilesHoriz;
    uniform float tilesVert;
    uniform float totalFrames;

    void main() {
      // Calculate current integer frame index (no scrolling)
      float frame = floor(offset);
      vPhase = fract(time + offset);
      float col = mod(frame, tilesHoriz);
      float row = floor(frame / tilesHoriz);

      // Compute scale and offset for sprite sheet UVs
      vFrameScale = vec2(1.0 / tilesHoriz, 1.0 / tilesVert);
      vFrameOffset = vec2(col * vFrameScale.x, (tilesVert - row - 1.0) * vFrameScale.y);

      // apply slight upward motion based on fade phase
      vec3 moved = position + vec3(0.0, vPhase * 0.2, 0.0);
      vec4 mvPosition = modelViewMatrix * vec4(moved, 1.0);
gl_PointSize = 256.0 / -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D map;
    varying vec2 vFrameOffset;
    varying vec2 vFrameScale;
    varying float vPhase;

    void main() {
      // Compute UV within the sprite tile
      vec2 uv = gl_PointCoord * vFrameScale + vFrameOffset;
      vec4 texColor = texture2D(map, uv);
      // apply fade in/out alpha
      float alpha = vPhase < 0.5 ? (vPhase * 2.0) : ((1.0 - vPhase) * 2.0);
      texColor.a *= alpha;
      if (texColor.a < 0.01) discard;
      gl_FragColor = texColor;
    }
  `,
});

 // --- Points ---
 // Load coffee model and add vapor emitter to it
 gltfLoader.load('/models/coffee.glb', (gltf) => {
   const coffee = gltf.scene;
   scene.add(coffee);
   // Compute bounding box for positioning emitter
   const box = new THREE.Box3().setFromObject(coffee);
   const center = box.getCenter(new THREE.Vector3());
   const maxY = box.max.y;
   // Create vapor emitter points
   const vapor = new THREE.Points(geometry, material);
   vapor.position.set(center.x, maxY + 0.1, center.z);
   scene.add(vapor);
 });

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);
  
  material.uniforms.time.value += 0.005; // Advance through 4-frame animation
  renderer.render(scene, camera);
}

animate();
