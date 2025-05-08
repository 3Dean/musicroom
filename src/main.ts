// Function to toggle light helpers visibility
/* function toggleLightHelpers() {
  if (lightHelpers.length === 0) {
    console.log("No light helpers to toggle");
    return;
  }
  
  // Toggle visibility of all helpers
  let currentState = null;
  
  // Get current state from first helper
  if (lightHelpers[0]) {
    currentState = lightHelpers[0].visible;
  }
  
  // Toggle to opposite state
  const newState = (currentState === null) ? true : !currentState;
  
  lightHelpers.forEach(helper => {
    helper.visible = newState;
  });
  
  console.log(`Light helpers ${newState ? 'shown' : 'hidden'}`);
} */
import './style.css';

// Extend the Window interface to include customLights
declare global {
  interface Window {
    customLights?: THREE.PointLight[];
  }
}
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
//import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
//import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
//import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { Audio as ThreeAudio } from 'three';
import * as THREE from 'three';

let pointLights: THREE.PointLight[] = [];
let hues: number[] = [];
let lightHelpers: THREE.Object3D[] = []; // Store light helpers

// Scene + Camera + Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x888888);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-1, 1.6, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.tabIndex = 0;
renderer.domElement.style.outline = 'none';

(window as any).scene = scene;
(window as any).camera = camera;
(window as any).renderer = renderer;
// Make updateModelPosition available globally
(window as any).updateModelPosition = (modelUrl: string, x: number, y: number, z: number) => {
  updateModelPosition(modelUrl, new THREE.Vector3(x, y, z));
};
// Function to get current couch positions
(window as any).getCouchPositions = () => {
  const positions: {[key: string]: THREE.Vector3} = {};
  scene.traverse((object) => {
    if (object.userData && object.userData.type) {
      const type = object.userData.type;
      if (type === 'couch_left' || type === 'couch_right') {
        const position = new THREE.Vector3();
        object.getWorldPosition(position);
        positions[type] = position;
      }
    }
  });
  console.log('Current couch positions:', positions);
  return positions;
};

// Function to reset couch positions to default values
(window as any).resetCouchPositions = () => {
  updateModelPosition('/models/couch_left.glb', new THREE.Vector3(-5, 2, 0));
  updateModelPosition('/models/couch_right.glb', new THREE.Vector3(5, 2, 0));
  console.log('Couch positions reset to default values');
};

// Help function to explain available functions
(window as any).couchHelp = () => {
  console.log(`
Available couch position functions:

1. updateModelPosition(modelUrl, x, y, z)
   - Updates the position of a model
   - Example: updateModelPosition('/models/couch_left.glb', -3, 0, 3)

2. getCouchPositions()
   - Returns the current positions of all couches
   - Example: getCouchPositions()

3. resetCouchPositions()
   - Resets all couch positions to their default values
   - Example: resetCouchPositions()

4. couchHelp()
   - Displays this help message
   - Example: couchHelp()
`);
};

// Log a message to let users know about the help function
console.log('Type "couchHelp()" in the console to see available couch position functions');

// Function to open the couch position tester
(window as any).openCouchTester = () => {
  window.open('couch-position-tester.html', 'couchTester', 'width=850,height=700');
};

// Add keyboard shortcut to open couch position tester (press 'P')
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyP') {
    (window as any).openCouchTester();
    console.log('Couch position tester opened in a new window');
  }
});

// Lights
const hemi = new THREE.HemisphereLight(0xfff3e6, 0x444444, 1.2);
hemi.position.set(0, 20, 0);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xfde6ff, 0.2);
dir.position.set(5, 10, 7.5);
scene.add(dir);

// Clear any existing light helpers
  lightHelpers.forEach(helper => {
    if (helper.parent) {
      helper.parent.remove(helper);
    }
  }); 
  lightHelpers = [];

// Add directional light helper
/*   const directionalHelper = new THREE.DirectionalLightHelper(dir, 5);
  scene.add(directionalHelper);
  lightHelpers.push(directionalHelper); */

  

  // Point lights (original array for color cycling)
  const positions = [
    new THREE.Vector3(-1, 4, 0),     // Light 1
    new THREE.Vector3(1, 4, 2),     // Light 2
    //new THREE.Vector3(-6.7, 5, 3.17),    // Light 3
    //new THREE.Vector3(-11, 5, 3.13)     // Light 4
  ];
  
  positions.forEach((pos, i) => {
    const light = new THREE.PointLight(0xff00ff, 100, 40, 3);
    light.position.copy(pos);
    scene.add(light);
    pointLights.push(light);
    hues.push(Math.random()); // optional: gives each light a different starting color
    
    // Add point light helper
    /* const pointLightHelper = new THREE.PointLightHelper(light, 1);
    scene.add(pointLightHelper);
    lightHelpers.push(pointLightHelper); */
  });
  

// Music
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new ThreeAudio(listener);

 // Use existing HTML audio element for controls and audio source
 const audioElement = document.querySelector('audio') as HTMLAudioElement;
 audioElement.crossOrigin = 'anonymous';
 audioElement.loop = true;
 audioElement.volume = 0.5;
sound.setMediaElementSource(audioElement);
sound.setVolume(0.5);
 audioElement.addEventListener('play', () => {
     if (listener.context.state === 'suspended') listener.context.resume();
     sound.play();
 });



// Plan to play audioElement on user interaction to comply with browser autoplay policies


// Controls
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);

// Ensure renderer canvas regains focus when pointer lock is active
document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === renderer.domElement) {
        renderer.domElement.focus();
        renderer.domElement.style.cursor = "none";
    } else {
        renderer.domElement.style.cursor = "auto";
        // Reset movement state when pointer is unlocked
        moveState.forward = false;
        moveState.backward = false;
        moveState.left = false;
        moveState.right = false;
    }
});
// ESC key shows cursor
window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') renderer.domElement.style.cursor = 'auto';
});

 // Click on audio element: resume context and start audio
 audioElement.addEventListener('click', (e) => {
     e.stopPropagation();
     if (listener.context.state === 'suspended') listener.context.resume();
     sound.play();
 });

 // Click on canvas to lock pointer and resume audio context
 renderer.domElement.addEventListener('click', () => {
     controls.lock();
 });

// Navmesh collision collector
const collidableMeshList: THREE.Mesh[] = [];

// Couch interaction
const couchObjects: THREE.Object3D[] = [];
let nearCouch: THREE.Object3D | null = null;
let isSitting = false;
let sittingPosition = new THREE.Vector3();
let sittingRotation = new THREE.Euler();
let standingPosition = new THREE.Vector3();
let standingHeight = 1.6; // Default standing height
const proximityDistance = 2.25; // Increased from 2 to make detection easier

// Debug information
console.log("Couch interaction system initialized");

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
  '/models/couch_left.glb', // Will be tracked for sitting
  '/models/couch_right.glb', // Will be tracked for sitting
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
  //'/models/structure.glb',
  '/models/vinylrecord.glb',
  '/models/sphereenv.glb',
  '/models/structure_floor.glb',
  '/models/structure_wall001.glb',
  '/models/structure_wall002.glb',
  '/models/structure_wall003.glb',
  '/models/rug.glb'
];

const pickableUrls = ['/models/boss.glb', '/models/leakstereo.glb', '/models/vinylrecord.glb'];
const interactiveObjects: THREE.Mesh[] = [];
let heldObject: THREE.Mesh | null = null;
const raycaster = new THREE.Raycaster();
const pickupDistance = 2;
let hoveredObject: THREE.Mesh | null = null;

// Define positions for couch models
const modelPositions: { [key: string]: THREE.Vector3 } = {
  '/models/couch_left.glb': new THREE.Vector3(-3.7, 0, .8),  // Adjust these values as needed
  '/models/couch_right.glb': new THREE.Vector3(2.5, 0, .8)   // Adjust these values as needed
};

// Function to update model position
function updateModelPosition(modelUrl: string, position: THREE.Vector3) {
  // Update the position in the modelPositions object
  modelPositions[modelUrl] = position;
  
  // Find the model in the scene and update its position
  scene.traverse((object) => {
    if (object.userData && object.userData.type) {
      const type = object.userData.type;
      if ((type === 'couch_left' && modelUrl === '/models/couch_left.glb') || 
          (type === 'couch_right' && modelUrl === '/models/couch_right.glb')) {
        object.position.copy(position);
        
        // Update helper sphere position
        const couchPosition = new THREE.Vector3();
        object.getWorldPosition(couchPosition);
        
        // Find the helper sphere for this couch
        scene.traverse((child) => {
          if (child.userData && child.userData.helperFor === type) {
            child.position.copy(couchPosition);
            child.position.y += 2; // Position above the couch for visibility
          }
        });
        
        console.log(`Updated ${type} position to:`, couchPosition);
      }
    }
  });
}

// Example usage:
// updateModelPosition('/models/couch_left.glb', new THREE.Vector3(-5, 0, 3));

staticModelUrls.forEach(url => {
  loader.load(url, (gltf: any) => {
    const modelScene = gltf.scene;
    scene.add(modelScene);
    
    // Set position for specific models if defined
    if (modelPositions[url]) {
      modelScene.position.copy(modelPositions[url]);
    }
    
    // Track couch objects for sitting interaction
    if (url === '/models/couch_left.glb' || url === '/models/couch_right.glb') {
      couchObjects.push(modelScene);
      modelScene.userData.type = url.includes('left') ? 'couch_left' : 'couch_right';
      
      // Log couch position for debugging
      const couchPosition = new THREE.Vector3();
      modelScene.getWorldPosition(couchPosition);
      console.log(`Loaded ${modelScene.userData.type} at position:`, couchPosition);
      
      // Add a helper sphere to visualize the couch position
      const sphereGeometry = new THREE.SphereGeometry(.2, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const sphereHelper = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphereHelper.position.copy(couchPosition);
      sphereHelper.position.y += 2; // Position above the couch for visibility
      // Store reference to which couch this helper belongs to
      sphereHelper.userData = { helperFor: modelScene.userData.type };
      scene.add(sphereHelper);
    }
    
    if (pickableUrls.includes(url)) {
      modelScene.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          interactiveObjects.push(child as THREE.Mesh);
        }
      });
    }
  });
});

// Create a prompt element for sitting interaction
const interactionPrompt = document.createElement('div');
interactionPrompt.style.position = 'absolute';
interactionPrompt.style.top = '50%';
interactionPrompt.style.left = '50%';
interactionPrompt.style.transform = 'translate(-50%, -50%)';
interactionPrompt.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
interactionPrompt.style.color = 'white';
interactionPrompt.style.padding = '10px';
interactionPrompt.style.borderRadius = '5px';
interactionPrompt.style.fontFamily = 'Arial, sans-serif';
interactionPrompt.style.fontSize = '16px';
interactionPrompt.style.display = 'none';
interactionPrompt.style.pointerEvents = 'none'; // Prevent interaction with the prompt
document.body.appendChild(interactionPrompt);

// Create debug display for position information
const debugDisplay = document.createElement('div');
debugDisplay.style.position = 'absolute';
debugDisplay.style.top = '10px';
debugDisplay.style.left = '10px';
debugDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
debugDisplay.style.color = 'white';
debugDisplay.style.padding = '10px';
debugDisplay.style.borderRadius = '5px';
debugDisplay.style.fontFamily = 'monospace';
debugDisplay.style.fontSize = '12px';
debugDisplay.style.pointerEvents = 'none'; // Prevent interaction with the debug display
debugDisplay.style.maxWidth = '300px';
debugDisplay.style.overflow = 'hidden';
debugDisplay.style.whiteSpace = 'pre-wrap';
debugDisplay.style.zIndex = '1000';
document.body.appendChild(debugDisplay);

// Create a hint for the couch position tester
const couchTesterHint = document.createElement('div');
couchTesterHint.style.position = 'absolute';
couchTesterHint.style.bottom = '10px';
couchTesterHint.style.right = '10px';
couchTesterHint.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
couchTesterHint.style.color = 'white';
couchTesterHint.style.padding = '10px';
couchTesterHint.style.borderRadius = '5px';
couchTesterHint.style.fontFamily = 'Arial, sans-serif';
couchTesterHint.style.fontSize = '14px';
couchTesterHint.style.pointerEvents = 'none'; // Prevent interaction with the hint
couchTesterHint.style.zIndex = '1000';
couchTesterHint.textContent = 'Press P to open couch position tester';
document.body.appendChild(couchTesterHint);

// Hide the hint after 10 seconds
setTimeout(() => {
  couchTesterHint.style.opacity = '0';
  couchTesterHint.style.transition = 'opacity 1s ease-out';
  
  // Remove from DOM after fade out
  setTimeout(() => {
    couchTesterHint.remove();
  }, 1000);
}, 10000);

// Function to update debug display
function updateDebugDisplay() {
  if (!debugDisplay) return;
  
  const playerPos = controls.object.position.clone();
  let nearestCouchInfo = 'None';
  
  if (nearCouch) {
    const couchPos = new THREE.Vector3();
    nearCouch.getWorldPosition(couchPos);
    const distance = playerPos.distanceTo(couchPos);
    nearestCouchInfo = `${nearCouch.userData.type}\nPosition: ${couchPos.x.toFixed(2)}, ${couchPos.y.toFixed(2)}, ${couchPos.z.toFixed(2)}\nDistance: ${distance.toFixed(2)}`;
  }
  
  debugDisplay.textContent = 
`Player Position: ${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(2)}, ${playerPos.z.toFixed(2)}
Sitting: ${isSitting ? 'Yes' : 'No'}
Nearest Couch: ${nearestCouchInfo}`;
}

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

// PICKUP interaction
window.addEventListener('mousedown', (event) => {
  event.preventDefault();
  if (heldObject) {
    // Drop object
    const directionVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const dropPosition = camera.getWorldPosition(new THREE.Vector3()).add(directionVector.multiplyScalar(pickupDistance));
    controls.object.remove(heldObject);
    scene.add(heldObject);
    heldObject.position.copy(dropPosition);
    heldObject = null;
  } else {
      // Pick up object
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects<THREE.Mesh>(interactiveObjects, true);
      if (intersects.length > 0) {
        const picked = intersects[0].object as THREE.Mesh;
        heldObject = picked;
        // @ts-ignore
        scene.remove(heldObject);
        controls.object.add(heldObject);
        heldObject.position.set(0, 0, -pickupDistance);
      }
  }
});

// WASD movement + collision
const moveState = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();

 // WASD movement + collision (global listener for key events)
 window.addEventListener('keydown', (e) => {
   // Handle sitting/standing with E and W keys
   if (e.code === 'KeyE' && nearCouch && !isSitting) {
     // Sit on the couch
     isSitting = true;
     standingPosition.copy(controls.object.position);
     
     // Determine sitting position based on couch type
     const couchType = nearCouch.userData.type;
     const couchPosition = new THREE.Vector3();
     nearCouch.getWorldPosition(couchPosition);
     
     // Set position based on couch type
     if (couchType === 'couch_left') {
       // Adjust these offsets as needed based on the new couch position
       sittingPosition.set(couchPosition.x - 0.2, couchPosition.y + 1.5, couchPosition.z + 0.2);
       console.log(`Sitting on couch_left at position:`, sittingPosition);
     } else { // couch_right
       // Adjust these offsets as needed based on the new couch position
       sittingPosition.set(couchPosition.x + 0.2, couchPosition.y + 1.5, couchPosition.z + 0.2);
       console.log(`Sitting on couch_right at position:`, sittingPosition);
     }
     
     // Calculate rotation to face the center of the room (0,0,0)
     const centerPoint = new THREE.Vector3(0, sittingPosition.y, 0); // Keep the same y-height
     const direction = new THREE.Vector3().subVectors(centerPoint, sittingPosition).normalize();
     
     // Calculate the angle to the center point
     // Math.atan2 takes (y, x) but we're working in the x-z plane for rotation around y-axis
     // Adding Math.PI (180 degrees) to flip the direction
     const angle = Math.atan2(direction.x, direction.z) + Math.PI;
     sittingRotation.set(0, angle, 0);
     
     console.log(`Calculated rotation to face center: ${angle.toFixed(2)} radians`);
     
     // Log the player's current position for debugging
     console.log(`Player position before sitting:`, controls.object.position);
     
     // Apply position and rotation
     controls.object.position.copy(sittingPosition);
     camera.rotation.copy(sittingRotation);
     
     // Disable movement while sitting
     moveState.forward = false;
     moveState.backward = false;
     moveState.left = false;
     moveState.right = false;
     
     // Update prompt
     interactionPrompt.textContent = 'Press W to stand';
     return;
   }
   
   if (e.code === 'KeyW' && isSitting) {
     // Stand up from the couch
     isSitting = false;
     controls.object.position.copy(standingPosition);
     interactionPrompt.style.display = 'none';
   }
   
   // Only allow movement if not sitting
   if (!isSitting) {
     if (e.code === 'KeyW') moveState.forward = true;
     if (e.code === 'KeyS') moveState.backward = true;
     if (e.code === 'KeyA') moveState.left = true;
     if (e.code === 'KeyD') moveState.right = true;
   }
 });
 
 window.addEventListener('keyup', (e) => {
   if (!isSitting) {
     if (e.code === 'KeyW') moveState.forward = false;
     if (e.code === 'KeyS') moveState.backward = false;
     if (e.code === 'KeyA') moveState.left = false;
     if (e.code === 'KeyD') moveState.right = false;
   }
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

  // Update original color cycling point lights
  pointLights.forEach((light, i) => {
    hues[i] += 0.002; // control speed here
    if (hues[i] > 1) hues[i] = 0;
    light.color.setHSL(hues[i], 1, 0.5);
  });
  
  // Update custom cycling lights
  if (window.customLights && window.customLights.length > 0) {
    window.customLights.forEach(light => {
      if (light.userData) {
        light.userData.hue += light.userData.cycleSpeed || 0.001;
        if (light.userData.hue > 1) light.userData.hue = 0;
        light.color.setHSL(
          light.userData.hue,
          light.userData.saturation || 1.0,
          light.userData.lightness || 0.5
        );
      }
    });
  }
  
  // Update blinking lights
  /* if (window.blinkingLights && window.blinkingLights.length > 0) {
    window.blinkingLights.forEach(light => {
      if (light.userData) {
        const { blinkSpeed, minIntensity, maxIntensity } = light.userData;
        // Create a sine wave pattern for smooth blinking
        const intensityFactor = (Math.sin(time * 0.001 * blinkSpeed * Math.PI) + 1) * 0.5; // 0 to 1
        const newIntensity = minIntensity + intensityFactor * (maxIntensity - minIntensity);
        light.intensity = newIntensity;
      }
    });
  } */

  // Hover highlight detection
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hoverHits = raycaster.intersectObjects<THREE.Mesh>(interactiveObjects, true);
  if (hoverHits.length > 0) {
    const picked = hoverHits[0].object as THREE.Mesh;
    if (picked !== hoveredObject) {
      if (hoveredObject) {
        const prevMat = hoveredObject.material as THREE.MeshStandardMaterial;
        prevMat.emissive.setHex(0x000000);
      }
      hoveredObject = picked;
      const mat = hoveredObject.material as THREE.MeshStandardMaterial;
      mat.emissive = new THREE.Color(0x00ff00);
      mat.emissiveIntensity = 0.5;
    }
  } else if (hoveredObject) {
    const mat = hoveredObject.material as THREE.MeshStandardMaterial;
    mat.emissive.setHex(0x000000);
    hoveredObject = null;
  }

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
  if (collidableMeshList.length > 0 && !isSitting) {
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
      controls.object.position.y = hits[0].point.y + standingHeight;
    } else {
      controls.object.position.copy(oldPos);
    }
    
    // Check for proximity to couches
    let isNearAnyCouches = false;
    if (couchObjects.length > 0) {
      const playerPosition = controls.object.position.clone();
      
      for (const couch of couchObjects) {
        const couchPosition = new THREE.Vector3();
        couch.getWorldPosition(couchPosition);
        
        const distance = playerPosition.distanceTo(couchPosition);
        if (distance < proximityDistance) { // Use the increased proximity distance
          isNearAnyCouches = true;
          nearCouch = couch;
          
          // Show interaction prompt
          interactionPrompt.textContent = 'Press E to sit';
          interactionPrompt.style.display = 'block';
          break;
        }
      }
      
      if (!isNearAnyCouches) {
        nearCouch = null;
        interactionPrompt.style.display = 'none';
      }
    }
  }

  // Update debug display
  updateDebugDisplay();
  
  renderer.render(scene, camera);
}

animate();
