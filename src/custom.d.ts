declare module 'three/examples/jsm/loaders/GLTFLoader';
declare module 'three/examples/jsm/controls/PointerLockControls';

declare module './addingVapor.js' {
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  export function addVaporToCoffee(scene: THREE.Scene, gltfLoader: GLTFLoader): THREE.ShaderMaterial;
}
