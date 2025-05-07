import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
//import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
//import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
//import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { Audio as ThreeAudio } from 'three';

// Scene + Camera + Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x888888);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-1, 1.6, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
hemi.position.set(0, 20, 0);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 7.5);
scene.add(dir);

// Music
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new ThreeAudio(listener);

// Streaming audio via HTMLAudioElement to support continuous audio stream
const audioElement = document.createElement('audio');
audioElement.crossOrigin = 'anonymous';
audioElement.loop = true;
audioElement.preload = 'auto';
audioElement.volume = 0.0;
audioElement.style.display = 'none';
audioElement.src = 'https://ice4.somafm.com/groovesalad-128-mp3';
document.body.appendChild(audioElement);
sound.setMediaElementSource(audioElement);
sound.setVolume(0.5);
// Plan to play audioElement on user interaction to comply with browser autoplay policies


// Controls
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);
document.body.addEventListener('click', () => {
    controls.lock();
    if (listener.context.state === 'suspended') {
        listener.context.resume();
    }
    audioElement.play();
    sound.play();
});

// Navmesh collision collector
const collidableMeshList: THREE.Mesh[] = [];

// Preload emission textures
const emitLoader = new THREE.TextureLoader();
const EMIT_COUNT = 200;
const emitTextures: THREE.Texture[] = [];
for (let i = 0; i < EMIT_COUNT; i++) {
  const idx = i.toString().padStart(5, '0');
  const tex = emitLoader.load(`/images/mixingboardemit/mixingboard_emit_${idx}.jpg`);
  tex.flipY = false;
  // Ensure UV coordinates are used directly
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  emitTextures.push(tex);
}

// GLTF Loader
const loader = new GLTFLoader();

// Store mixing-board meshes for animation
const mixingBoardMeshes: THREE.Mesh[] = [];

// Animation timing
let emitFrame = 0;
let emitAccumulator = 0;
const EMIT_FPS = 24;
const EMIT_INTERVAL = 1 / EMIT_FPS;
const emitClock = new THREE.Clock();

// Load navmesh (invisible, collision only)
loader.load('/models/navmesh.glb', (gltf: any) => {
  const nav = gltf.scene;
  nav.visible = false;
  scene.add(nav);
  nav.traverse((child: THREE.Object3D) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.visible = false;
      collidableMeshList.push(mesh);
    }
  });
});

loader.load('/models/mixingboard.glb', (gltf: any) => {
  const board = gltf.scene;
  board.traverse((child: THREE.Object3D) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const stdMat = (mesh.material as THREE.MeshStandardMaterial).clone();
      stdMat.emissive = new THREE.Color(0xffffff);
      stdMat.emissiveIntensity = 1;
      stdMat.emissiveMap = emitTextures[0];
      mesh.material = stdMat;
      mixingBoardMeshes.push(mesh);
    }
  });
  scene.add(board);
});

// Load other models into scene
const staticModelUrls = [
  '/models/boss.glb',
  '/models/cabinet_left.glb',
  '/models/cabinet_right.glb',
  '/models/chair.glb',
  '/models/coffee.glb',
  '/models/couch_left.glb',
  '/models/couch_right.glb',
  '/models/desk.glb',
  '/models/frames.glb',
  '/models/image01.glb',
  '/models/image02.glb',
  '/models/image03.glb',
  '/models/image04.glb',
  '/models/leakstereo.glb',
  '/models/plants.glb',
  '/models/soundboard.glb',
  '/models/speakers.glb',
  '/models/structure.glb',
  '/models/vinylrecord.glb',
  '/models/sphereenv.glb'
];
staticModelUrls.forEach(url => {
  loader.load(url, (gltf: any) => {
    scene.add(gltf.scene);
  });
});

// TV screen with looping video texture
const video = document.createElement('video');
video.src = '/videos/tvscreen.mp4';
video.crossOrigin = 'anonymous';
video.loop = true;
video.muted = true;
video.play();
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBAFormat;

loader.load('/models/tvscreen.glb', (gltf: any) => {
  gltf.scene.traverse((child: THREE.Object3D) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.material = new THREE.MeshBasicMaterial({ map: videoTexture });
    }
  });
  scene.add(gltf.scene);
});

// WASD movement + collision
const moveState = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') moveState.forward = true;
  if (e.code === 'KeyS') moveState.backward = true;
  if (e.code === 'KeyA') moveState.left = true;
  if (e.code === 'KeyD') moveState.right = true;
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') moveState.forward = false;
  if (e.code === 'KeyS') moveState.backward = false;
  if (e.code === 'KeyA') moveState.left = false;
  if (e.code === 'KeyD') moveState.right = false;
});

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Main loop
function animate() {
  requestAnimationFrame(animate);

  // Animate emissive map
  if (mixingBoardMeshes.length > 0) {
    emitAccumulator += emitClock.getDelta();
    if (emitAccumulator >= EMIT_INTERVAL) {
      emitFrame = (emitFrame + 1) % emitTextures.length;
      mixingBoardMeshes.forEach(mesh => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveMap = emitTextures[emitFrame];
        mat.needsUpdate = true;
      });
      emitAccumulator -= EMIT_INTERVAL;
    }
  }

  // Movement & collision
  if (collidableMeshList.length > 0) {
    const delta = clock.getDelta();
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.x = Number(moveState.right) - Number(moveState.left);
    direction.z = Number(moveState.forward) - Number(moveState.backward);
    direction.normalize();

    const speed = 50.0;
    velocity.x += direction.x * speed * delta;
    velocity.z += direction.z * speed * delta;

    const oldPos = controls.object.position.clone();
    controls.moveRight(velocity.x * delta);
    controls.moveForward(velocity.z * delta);

    const rayOrigin = controls.object.position.clone();
    rayOrigin.y += 10;
    const downRay = new THREE.Raycaster(rayOrigin, new THREE.Vector3(0, -1, 0));
    const hits = downRay.intersectObjects(collidableMeshList);
    if (hits.length > 0) {
      controls.object.position.y = hits[0].point.y + 1.6;
    } else {
      controls.object.position.copy(oldPos);
    }
  }

  renderer.render(scene, camera);
}

animate();
