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
import { addVaporToCoffee } from './addingVapor.js'; // Import the vapor function
//import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
//import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
//import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// import { Audio as ThreeAudio } from 'three'; // Removed as ThreeAudio is not used
import * as THREE from 'three';

let pointLights: THREE.PointLight[] = [];
let hues: number[] = [];
let lightHelpers: THREE.Object3D[] = []; // Store light helpers

// Scene + Camera + Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x888888);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-0.84, 1.64, 0.45); // Set initial camera position

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
// Function to get current seatable object positions
(window as any).getSeatingPositions = () => {
  const positions: {[key: string]: THREE.Vector3} = {};
  scene.traverse((object) => {
    if (object.userData && object.userData.type) {
      const type = object.userData.type;
      if (type === 'couch_left' || type === 'couch_right' || type === 'chair') {
        const position = new THREE.Vector3();
        object.getWorldPosition(position);
        positions[type] = position;
      }
    }
  });
  console.log('Current seating positions:', positions);
  return positions;
};

// Keep the old function for backward compatibility
(window as any).getCouchPositions = (window as any).getSeatingPositions;

// Function to reset seatable object positions to default values
(window as any).resetSeatingPositions = () => {
  updateModelPosition('/models/couch_left.glb', new THREE.Vector3(-3.7, 0, .8));
  updateModelPosition('/models/couch_right.glb', new THREE.Vector3(2.5, 0, .8));
  updateModelPosition('/models/chair.glb', new THREE.Vector3(0, 0, 0));
  console.log('Seating positions reset to default values');
};

// Keep the old function for backward compatibility
(window as any).resetCouchPositions = (window as any).resetSeatingPositions;

// Help function to explain available functions
(window as any).seatingHelp = () => {
  console.log(`
Available seating position functions:

1. updateModelPosition(modelUrl, x, y, z)
   - Updates the position of a model
   - Example: updateModelPosition('/models/couch_left.glb', -3, 0, 3)
   - Example: updateModelPosition('/models/chair.glb', 0, 0, 3)

2. getSeatingPositions()
   - Returns the current positions of all seatable objects (couches and chair)
   - Example: getSeatingPositions()

3. resetSeatingPositions()
   - Resets all seatable object positions to their default values
   - Example: resetSeatingPositions()

4. seatingHelp()
   - Displays this help message
   - Example: seatingHelp()

Note: The older functions getCouchPositions() and resetCouchPositions() 
are still available for backward compatibility.
`);
};

// Keep the old function for backward compatibility
(window as any).couchHelp = (window as any).seatingHelp;

// Log a message to let users know about the help function
console.log('Type "seatingHelp()" in the console to see available seating position functions');

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
  
  positions.forEach((pos /*, i // Removed unused index 'i' */) => {
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

// Get the audio controls container from the DOM
const audioControlsContainer = document.getElementById('audioControls');
if (!audioControlsContainer) {
  console.error('Audio controls container not found in the DOM');
  throw new Error('Audio controls container not found in the DOM');
}

// Create play/pause button
const playButton = document.createElement('button');
playButton.textContent = 'Play Music';
playButton.style.padding = '8px 12px';
playButton.style.backgroundColor = '#007bff';
playButton.style.color = 'white';
playButton.style.border = 'none';
playButton.style.borderRadius = '4px';
playButton.style.cursor = 'pointer';
playButton.style.fontWeight = 'bold';
playButton.style.fontSize = '14px';
audioControlsContainer.appendChild(playButton);

// Create volume slider
const volumeSlider = document.createElement('input');
volumeSlider.type = 'range';
volumeSlider.min = '0';
volumeSlider.max = '1';
volumeSlider.step = '0.1';
volumeSlider.value = '0.5';
volumeSlider.style.width = '100px';
// volumeSlider.style.accentColor = '#007bff'; // Removed to rely on CSS for thumb
volumeSlider.style.cursor = 'pointer';
volumeSlider.style.pointerEvents = 'auto';
volumeSlider.id = 'volumeSlider'; // Add ID for CSS targeting
// Explicitly apply styles for track and appearance from index.html
volumeSlider.style.webkitAppearance = 'none';
volumeSlider.style.appearance = 'none';
volumeSlider.style.height = '8px';
volumeSlider.style.borderRadius = '4px';
volumeSlider.style.background = '#444'; // Track color
volumeSlider.style.outline = 'none';

// Create volume label
const volumeLabel = document.createElement('span');
volumeLabel.textContent = 'Volume: 50%';
volumeLabel.style.color = 'white';
volumeLabel.style.fontSize = '14px';
volumeLabel.style.marginRight = '5px';

// Add volume label and slider to container
audioControlsContainer.appendChild(volumeLabel);
audioControlsContainer.appendChild(volumeSlider);

// Create HTML audio element for streaming
const audioElement = document.createElement('audio');
audioElement.style.display = 'none'; // Hide the audio element
document.body.appendChild(audioElement);

// URL of the stream
const streamUrl = 'https://ice4.somafm.com/groovesalad-128-mp3';
audioElement.src = streamUrl;
audioElement.crossOrigin = 'anonymous';
audioElement.preload = 'none'; // Don't preload until user clicks play

// Connect the HTML audio element to Three.js audio system
const sound = new THREE.Audio(listener);
sound.setMediaElementSource(audioElement);

// Track playing state
let isPlaying = false;

// Add loading indicator CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Play/pause button event listener
playButton.addEventListener('click', function() {
    if (listener.context.state === 'suspended') {
        listener.context.resume();
    }
    
    if (!isPlaying) {
        // Show loading state
        playButton.textContent = 'Loading...';
        playButton.disabled = true;
        playButton.style.backgroundColor = '#6c757d';
        
        // Add loading indicator
        const loadingIndicator = document.createElement('span');
        loadingIndicator.textContent = ' ⟳';
        loadingIndicator.style.display = 'inline-block';
        loadingIndicator.style.animation = 'spin 1s linear infinite';
        playButton.appendChild(loadingIndicator);
        
        // Start loading the audio
        audioElement.load();
        
        // Play when ready
        audioElement.play().then(() => {
            isPlaying = true;
            playButton.textContent = 'Pause';
            playButton.disabled = false;
            playButton.style.backgroundColor = '#dc3545'; // Red for pause
        }).catch(error => {
            console.error('Error playing audio:', error);
            playButton.textContent = 'Play Music';
            playButton.disabled = false;
            playButton.style.backgroundColor = '#007bff';
        });
    } else {
        audioElement.pause();
        isPlaying = false;
        playButton.textContent = 'Play Music';
        playButton.style.backgroundColor = '#007bff'; // Blue for play
    }
});

// Volume slider event listener
volumeSlider.addEventListener('input', function() {
    const volume = parseFloat(volumeSlider.value);
    audioElement.volume = volume;
    volumeLabel.textContent = `Volume: ${Math.round(volume * 100)}%`;
});

// Prevent mousedown on slider from propagating to PointerLockControls
volumeSlider.addEventListener('mousedown', function(event) {
    event.stopPropagation();
});

// Handle audio loading events
audioElement.addEventListener('waiting', () => {
    playButton.textContent = 'Loading...';
    playButton.disabled = true;
    playButton.style.backgroundColor = '#6c757d';
    
    // Add loading indicator if not already present
    if (!playButton.querySelector('span')) {
        const loadingIndicator = document.createElement('span');
        loadingIndicator.textContent = ' ⟳';
        loadingIndicator.style.display = 'inline-block';
        loadingIndicator.style.animation = 'spin 1s linear infinite';
        playButton.appendChild(loadingIndicator);
    }
});

audioElement.addEventListener('playing', () => {
    playButton.textContent = 'Pause';
    playButton.disabled = false;
    playButton.style.backgroundColor = '#dc3545';
});

audioElement.addEventListener('error', (e) => {
    console.error('Audio error:', e);
    playButton.textContent = 'Error';
    playButton.disabled = false;
    playButton.style.backgroundColor = '#dc3545';
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
        
        // Ensure audio controls remain visible and interactive when pointer lock is active
        if (audioControlsContainer) {
            audioControlsContainer.style.display = 'flex';
            audioControlsContainer.style.zIndex = '9999';
            audioControlsContainer.style.pointerEvents = 'auto';
        }
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


 // Click on canvas to lock pointer and resume audio context
 renderer.domElement.addEventListener('click', () => {
     controls.lock();
 });

// Navmesh collision collector
const collidableMeshList: THREE.Mesh[] = [];

// Sitting position model and interaction
const sittingPositionObjects: THREE.Object3D[] = [];
const couchObjects: THREE.Object3D[] = [];
let nearCouch: THREE.Object3D | null = null;
let nearSittingPosition: THREE.Object3D | null = null;
let isSitting = false;
let sittingPosition = new THREE.Vector3();
let sittingRotation = new THREE.Euler();
let standingPosition = new THREE.Vector3();
let standingHeight = 1.6; // Default standing height
const proximityDistance = 2.18; // Increased from 2 to make detection easier

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

// Vapor effect material
let vaporEffectMaterial: THREE.ShaderMaterial | null = null;

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
  // '/models/coffee.glb', // Coffee model will be loaded by addVaporToCoffee
  '/models/couch_left.glb', // Will be tracked for sitting
  '/models/couch_right.glb', // Will be tracked for sitting
  '/models/desk.glb',
  '/models/frames.glb',
  '/models/image01.glb',
  '/models/image02.glb',
  '/models/image03.glb',
  '/models/image04.glb',
  '/models/leakstereo.glb',
  '/models/soundboard.glb',
  '/models/speakers.glb',
  //'/models/structure.glb',
  '/models/vinylrecord.glb',
  '/models/sphereenv.glb',
  '/models/structure_floor.glb',
  '/models/structure_wall001.glb',
  '/models/structure_wall002.glb',
  '/models/structure_wall003.glb',
  '/models/rug.glb',
  //'/models/plants.glb',
  '/models/plantleaves.glb',
  '/models/plantstands.glb',
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

// Function to create sitting position models at couch and chair locations
function createSittingPositions() {
  // Clear existing sitting position objects
  sittingPositionObjects.forEach(obj => {
    scene.remove(obj);
  });
  sittingPositionObjects.length = 0;
  
  // Create new sitting position objects based on seatable object positions
  couchObjects.forEach(seatable => {
    const objectPosition = new THREE.Vector3();
    seatable.getWorldPosition(objectPosition);
    const objectType = seatable.userData.type;
    
    // Load and clone the sitting position model
    loader.load('/models/sittingposition.glb', (gltf: any) => {
      const sittingModel = gltf.scene.clone();
      
      // Position the sitting model relative to the object type
      if (objectType === 'chair') {
        // Position for chair - centered on the chair with appropriate height
        sittingModel.position.set(objectPosition.x + 0.1, objectPosition.y + 0.5, objectPosition.z -.4);
        
        // For chair, we want to face forward (assuming chair faces -Z direction)
        // You may need to adjust this angle based on the chair's orientation
        sittingModel.rotation.set(0, 0, 0);
      } else if (objectType === 'couch_left') {
        // Position for left couch
        sittingModel.position.set(objectPosition.x - 0.1, objectPosition.y + 0.5, objectPosition.z + 0.5);
        
        // Calculate rotation to face the center of the room
        const centerPoint = new THREE.Vector3(0, sittingModel.position.y, 0);
        const direction = new THREE.Vector3().subVectors(centerPoint, sittingModel.position).normalize();
        const angle = Math.atan2(direction.x, direction.z) + Math.PI;
        sittingModel.rotation.set(0, angle, 0);
      } else { // couch_right
        // Position for right couch
        sittingModel.position.set(objectPosition.x + 0.1, objectPosition.y + 0.5, objectPosition.z + 0.5);
        
        // Calculate rotation to face the center of the room
        const centerPoint = new THREE.Vector3(0, sittingModel.position.y, 0);
        const direction = new THREE.Vector3().subVectors(centerPoint, sittingModel.position).normalize();
        const angle = Math.atan2(direction.x, direction.z) + Math.PI;
        sittingModel.rotation.set(0, angle, 0);
      }
      
      // Store reference to which object this sitting position belongs to
      sittingModel.userData = { 
        type: 'sitting_position',
        forCouch: objectType
      };
      
      // Make the model invisible but keep it in the scene for interaction
      sittingModel.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          // Set to false to make invisible, true for debugging
          (child as THREE.Mesh).visible = false;
        }
      });
      
      scene.add(sittingModel);
      sittingPositionObjects.push(sittingModel);
      
      console.log(`Created sitting position for ${objectType} at:`, sittingModel.position);
    });
  });
}

// Function to update model position
function updateModelPosition(modelUrl: string, position: THREE.Vector3) {
  // Update the position in the modelPositions object
  modelPositions[modelUrl] = position;
  
  // Find the model in the scene and update its position
  scene.traverse((object) => {
    if (object.userData && object.userData.type) {
      const type = object.userData.type;
      if ((type === 'couch_left' && modelUrl === '/models/couch_left.glb') || 
          (type === 'couch_right' && modelUrl === '/models/couch_right.glb') ||
          (type === 'chair' && modelUrl === '/models/chair.glb')) {
        object.position.copy(position);
        
        // Update helper sphere position
        const objectPosition = new THREE.Vector3();
        object.getWorldPosition(objectPosition);
        
        // Find the helper sphere for this object
        scene.traverse((child) => {
          if (child.userData && child.userData.helperFor === type) {
            child.position.copy(objectPosition);
            child.position.y += 2; // Position above the object for visibility
          }
        });
        
        console.log(`Updated ${type} position to:`, objectPosition);
        
        // Update sitting positions when seatable objects move
        createSittingPositions();
      }
    }
  });
}

// Add chair position to modelPositions
modelPositions['/models/chair.glb'] = new THREE.Vector3(0, 0, 0); // Default chair position

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
    
// Track couch and chair objects for sitting interaction
    if (url === '/models/couch_left.glb' || url === '/models/couch_right.glb' || url === '/models/chair.glb') {
      couchObjects.push(modelScene);
      
      // Set the type based on the model
      if (url === '/models/chair.glb') {
        modelScene.userData.type = 'chair';
      } else {
        modelScene.userData.type = url.includes('left') ? 'couch_left' : 'couch_right';
      }
      
      // Log position for debugging
      const objectPosition = new THREE.Vector3();
      modelScene.getWorldPosition(objectPosition);
      console.log(`Loaded ${modelScene.userData.type} at position:`, objectPosition);
      
      // Add a helper sphere to visualize the position
      const sphereGeometry = new THREE.SphereGeometry(.2, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: url === '/models/chair.glb' ? 0x00ff00 : 0xff0000 // Green for chair, red for couches
      });
      const sphereHelper = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphereHelper.position.copy(objectPosition);
      sphereHelper.position.y += 2; // Position above the object for visibility
      // Store reference to which object this helper belongs to
      sphereHelper.userData = { helperFor: modelScene.userData.type };
      //scene.add(sphereHelper);
      
      // Create sitting positions after all seatable objects are loaded
      createSittingPositions();
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

// Initialize vapor effect
vaporEffectMaterial = addVaporToCoffee(scene, loader);

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
debugDisplay.style.top = '74px';
debugDisplay.style.left = '350px';
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
debugDisplay.style.display = 'none'; // Hide the debug display by default
document.body.appendChild(debugDisplay);

// Add debug display toggle functionality (press 'I' to toggle)
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyI') {
    debugDisplay.style.display = debugDisplay.style.display === 'none' ? 'block' : 'none';
    console.log(`Debug display ${debugDisplay.style.display === 'none' ? 'hidden' : 'shown'}`);
  }
});

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
  let nearestObjectInfo = 'None';
  let nearestSitPosInfo = 'None';
  
  if (nearCouch) {
    const objPos = new THREE.Vector3();
    nearCouch.getWorldPosition(objPos);
    const distance = playerPos.distanceTo(objPos);
    nearestObjectInfo = `${nearCouch.userData.type}\nPosition: ${objPos.x.toFixed(2)}, ${objPos.y.toFixed(2)}, ${objPos.z.toFixed(2)}\nDistance: ${distance.toFixed(2)}`;
  }
  
  if (nearSittingPosition) {
    const sitPos = new THREE.Vector3();
    nearSittingPosition.getWorldPosition(sitPos);
    const distance = playerPos.distanceTo(sitPos);
    nearestSitPosInfo = `For: ${nearSittingPosition.userData.forCouch}\nPosition: ${sitPos.x.toFixed(2)}, ${sitPos.y.toFixed(2)}, ${sitPos.z.toFixed(2)}\nDistance: ${distance.toFixed(2)}`;
  }
  
  debugDisplay.textContent = 
`Player Position: ${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(2)}, ${playerPos.z.toFixed(2)}
Sitting: ${isSitting ? 'Yes' : 'No'}
Nearest Seatable Object: ${nearestObjectInfo}
Nearest Sitting Position: ${nearestSitPosInfo}`;
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
   if (e.code === 'KeyE' && nearSittingPosition && !isSitting) {
     // Sit on the sitting position
     isSitting = true;
     standingPosition.copy(controls.object.position);
     
     // Get the sitting position from the model
     const sitPosition = new THREE.Vector3();
     nearSittingPosition.getWorldPosition(sitPosition);
     
     // Use the sitting position model's position and rotation
     sittingPosition.copy(sitPosition);
     sittingPosition.y += 1.0; // Adjust height to match the sitting position model
     
     // Get the rotation from the sitting position model
     sittingRotation.copy(nearSittingPosition.rotation);
     
     console.log(`Sitting at position:`, sittingPosition);
     console.log(`Using rotation:`, sittingRotation);
     
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
     
     // Reset movement state and velocity to prevent immediate forward launch
     moveState.forward = false; 
     velocity.x = 0;
     velocity.z = 0;
     return; // Prevent further processing of 'W' key in this event
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

    const speed = 40.0;
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
    
    // Check for proximity to sitting positions
    let isNearAnySittingPosition = false;
    if (sittingPositionObjects.length > 0) {
      const playerPosition = controls.object.position.clone();
      
      for (const sitPos of sittingPositionObjects) {
        const sitPosition = new THREE.Vector3();
        sitPos.getWorldPosition(sitPosition);
        
        const distance = playerPosition.distanceTo(sitPosition);
        if (distance < proximityDistance) { // Use the increased proximity distance
          isNearAnySittingPosition = true;
          nearSittingPosition = sitPos;
          
          // Find the associated couch for reference
          const couchType = sitPos.userData.forCouch;
          scene.traverse((object) => {
            if (object.userData && object.userData.type === couchType) {
              nearCouch = object;
            }
          });
          
          // Show interaction prompt
          interactionPrompt.textContent = 'Press E to sit';
          interactionPrompt.style.display = 'block';
          break;
        }
      }
      
      if (!isNearAnySittingPosition) {
        nearSittingPosition = null;
        nearCouch = null;
        interactionPrompt.style.display = 'none';
      }
    }
  }

  // Update debug display
  updateDebugDisplay();

  // Update vapor animation
  if (vaporEffectMaterial) {
    vaporEffectMaterial.uniforms.time.value += 0.005; // Adjust speed as needed
  }
  
  renderer.render(scene, camera);
}

animate();
