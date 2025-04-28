import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.120.1/build/three.module.js';


////////////////////////////////////////////////////////////


// Camera Info Element
const camInfoDiv = document.getElementById('cam-info');
const viewInfoDiv = document.getElementById('view-info');

// Camera Position
var camera_px = 0;   // ( riht - left )
var camera_py = 10;  // ( up - down )
var camera_pz = 20;  // ( front - back )

// Camera View
var camera_vx = 0;
var camera_vy = 0;
var camera_vz = 0;


////////////////////////////////////////////////////////////



// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(camera_px, camera_py, camera_pz);
camera.lookAt(camera_vx, camera_vy, camera_vz);

// Camera Info Initial
displayCameraInfo();

// Renderer Setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Grid Setup
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

// Light Setup
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

////////////////////////////////////////////////////////////


var texture_sun = new THREE.TextureLoader().load( 'materials/sun.jpg' );
const geometry_sun = new THREE.SphereGeometry( 5, 32, 16 ); 
// const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
const material_sun = new THREE.MeshBasicMaterial( { map: texture_sun } ); 
const sun = new THREE.Mesh( geometry_sun, material_sun ); 
sun.position.set(50, 20, -50);
scene.add( sun );


////////////////////////////////////////////////////////////


var texture_eye = new THREE.TextureLoader().load( 'materials/blue.jpg' );
const geometry_eye = new THREE.SphereGeometry( 1, 6, 6 ); 
// const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
const material_eye = new THREE.MeshBasicMaterial( { map: texture_eye } ); 
const eye = new THREE.Mesh( geometry_eye, material_eye ); 
eye.position.set(camera_vx, camera_vy, camera_vz);
scene.add( eye );


////////////////////////////////////////////////////////////


// Camera Update Position
function updateCameraPosition()
{
  camera.position.set(camera_px, camera_py, camera_pz);
  camera.lookAt(camera_vx, camera_vy, camera_vz);

  eye.position.set(camera_vx, camera_vy, camera_vz);

  displayCameraInfo();
}

// Camera Update Info
function displayCameraInfo()
{  
  const { x, y, z } = camera.position;
  camInfoDiv.innerText = `Camera Position:\nX: ${x.toFixed(2)}\nY: ${y.toFixed(2)}\nZ: ${z.toFixed(2)}`;
   
  viewInfoDiv.innerText = `View Position:\nX: ${camera_vx.toFixed(2)}\nY: ${camera_vy.toFixed(2)}\nZ: ${camera_vz.toFixed(2)}`;
}


////////////////////////////////////////////////////////////



// Control the view update toggle
var rotateDisabled = false;

// Step size for movement
var stepMove = 1;  // Default stepMove size for the camera movement
var stepUpdate = 0.5;  // Default stepUpdate size for the camera movement

// This function updates the camera position and view if needed
function handleCameraMovement(letter, isUp, stepSize) {
  // Update stepMove size if a custom stepMove is passed
  stepMove = stepSize || stepMove;

  // Handle movement for the specified axis (X, Y, Z)
  switch (letter) {
    case 'X':
      camera_px += isUp ? stepMove : -stepMove;
      if (rotateDisabled) camera_vx += isUp ? stepMove : -stepMove; // Update view as well
      break;
    case 'Y':
      camera_py += isUp ? stepMove : -stepMove;
      if (rotateDisabled) camera_vy += isUp ? stepMove : -stepMove; // Update view as well
      break;
    case 'Z':
      camera_pz += isUp ? stepMove : -stepMove;
      if (rotateDisabled) camera_vz += isUp ? stepMove : -stepMove; // Update view as well
      break;
    default:
      console.log('Invalid axis specified');
      return;
  }

  // Now, update the camera position and view
  updateCameraPosition();
}



////////////////////////////////////////////////////////////


// Axes Variables
let axesGroup = null;

// Axes Generate
function addAxesArrows(scene) {
  if (axesGroup) {
    scene.remove(axesGroup);
    axesGroup = null;
    return;
  }

  axesGroup = new THREE.Group();
  const boxSize = 0.2;
  const count = 250;

  const directions = [
    { axis: 'x', color: 0xff0000 },
    { axis: 'y', color: 0x00ff00 },
    { axis: 'z', color: 0x0000ff },
  ];

  directions.forEach(({ axis, color }) => {
    const material = new THREE.MeshBasicMaterial({ color });
    for (let i = -count; i <= count; i++) {
      const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
      const box = new THREE.Mesh(geometry, material);

      box.position.set(
        axis === 'x' ? i : 0,
        axis === 'y' ? i : 0,
        axis === 'z' ? i : 0
      );

      axesGroup.add(box);
    }
  });

  scene.add(axesGroup);
}


////////////////////////////////////////////////////////////


// Game Parameters
const blockSize = 0.8;
const worldWidth = 100;
const worldHeight = 50;

const tetrominoShapes = [
  [[1,1,1,1]], // I
  [[1,1],[1,1]], // O
  [[1,1,0],[0,1,1]], // Z
  [[0,1,1],[1,1,0]], // S
  [[1,0,0],[1,1,1]], // J
  [[0,0,1],[1,1,1]], // L
  [[0,1,0],[1,1,1]], // T
];

const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff, 0xffffff];

function createTetromino() {
  const shape = tetrominoShapes[Math.floor(Math.random() * tetrominoShapes.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({ color });
  shape.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        const cube = new THREE.Mesh(new THREE.BoxGeometry(blockSize, blockSize, blockSize), material);
        cube.position.set(x, -y, 0);
        group.add(cube);
      }
    });
  });

  group.position.set(4, worldHeight, 0);
  scene.add(group);
  return group;
}

////////////////////////////////////////////////////////////

// //generate initial 100 pieces

// var allPieces = [];
// var numberOfPieces = 100;

// for(var index = 0; index < numberOfPieces; numberOfPieces++)
// {
//   var current = {};
//   current.currentPiece = createTetromino();
//   current.dropSpeed = Math.floor(Math.random() * 2000);
//   current.lastDropTime = Date.now();

//   allPieces.push(current);
// }


// const now = Date.now();
//   if (now - lastDropTime > dropSpeed) {
//     currentPiece.position.y -= 1;
//     if (currentPiece.position.y <= 0) {
//       currentPiece = createTetromino();
//     }
//     lastDropTime = now;
//   }


////////////////////////////////////////////////////////////

// Animation Definition

let currentPiece = createTetromino();
const dropSpeed = 250; // ms
let lastDropTime = Date.now();

function animate() {
  requestAnimationFrame(animate);

  const now = Date.now();
  if (now - lastDropTime > dropSpeed) {
    currentPiece.position.y -= 1;
    if (currentPiece.position.y <= 0) {
      currentPiece = createTetromino();
    }
    lastDropTime = now;
  }

  renderer.render(scene, camera);
}

animate();

////////////////////////////////////////////////////////////

// Events Listners Tetrix
window.addEventListener('keydown', (e) => {
  if (!e.ctrlKey && false)
  {
    switch (e.code) {
      case 'ArrowLeft':
        currentPiece.position.x -= 1;        
        break;
      case 'ArrowRight':
        currentPiece.position.x += 1;       
        break;
      case 'ArrowDown':
        currentPiece.position.y -= 1;
        break;
      case 'ArrowUp':
        currentPiece.rotation.y += Math.PI / 2;
        break;
    }
  }
});

// Events Listners Camera
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && false)
  {
    switch (e.code) {
      case 'ArrowLeft':
        camera_py ++;
        updateCameraPosition();
        break;
      case 'ArrowRight':
        camera_py --;
        updateCameraPosition();
        break;
      case 'ArrowDown':
        camera_px ++;
        updateCameraPosition();
        break;
      case 'ArrowUp':
        camera_px --;
        updateCameraPosition();
        break;
    }
  }
});


////////////////////////////////////////////////////////////


// Events Axes On/Off
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.code === 'KeyA') {
    e.preventDefault();
    if (axesGroup) {
      axesGroup.visible = !axesGroup.visible;
    } else {
      addAxesArrows(scene); // first time
    }
    updateAxesStatus();
  }
});


////////////////////////////////////////////////////////////


// Events Update View Camera
function toggleViewUpdate() {
  rotateDisabled = !rotateDisabled;
  console.log('Rotate ' + (rotateDisabled ? 'disabled' : 'enabled'));
}

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.code === 'KeyV') {
    toggleViewUpdate(); // Toggle the view update on Ctrl + V
  }
  updateRotateStatus()
});


////////////////////////////////////////////////////////////


// Events Axes Camera Navigation
const keysPressed = {};

window.addEventListener('keydown', (e) => {
  keysPressed[e.code] = true;

  if (e.ctrlKey) {
    const mainKey = ['KeyX', 'KeyY', 'KeyZ', 'KeyM'].find(k => keysPressed[k]);
    const arrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].find(k => keysPressed[k]);

    if (mainKey && arrowKey) {
      handleCombo(mainKey, arrowKey);
    }
  }
});

window.addEventListener('keyup', (e) => {
  keysPressed[e.code] = false;
});

////////////////////////////////////////////////////////////

// Handle Combo Keus For Axes Camera Navigation
function handleCombo(letterKey, arrowKey) {
  const letter = letterKey.replace('Key', ''); 
  
  // Replace 'KeyX' → 'X'
  // Replace 'KeyY' → 'Y'
  // Replace 'KeyX' → 'Z'

  // Replace 'KeyS' → 'M'
  
  switch (`${letter}-${arrowKey}`) {
    case 'X-ArrowUp':
      console.log('Ctrl + X + ↑ => Move X up');
      handleCameraMovement(letter, true);
      break;
    case 'X-ArrowDown':
      console.log('Ctrl + X + ↓ => Move X down');
      handleCameraMovement(letter, false);
      break;

    case 'Y-ArrowUp':
      console.log('Ctrl + Y + ↑ => Move Y up');
      handleCameraMovement(letter, true);
      break;
    case 'Y-ArrowDown':
      console.log('Ctrl + Y + ↓ => Move Y down');
      handleCameraMovement(letter, false);
      break;

    case 'Z-ArrowUp':
      console.log('Ctrl + Z + ↑ => Move Z up');
      handleCameraMovement(letter, true);
      break;
    case 'Z-ArrowDown':
      console.log('Ctrl + Z + ↓ => Move Z down');
      handleCameraMovement(letter, false);
      break;


    case 'X-ArrowLeft':
      console.log(`Ctrl + ${letter} + ← => Rotate ${letter} left`);
      break;
    case 'Y-ArrowLeft':
      console.log(`Ctrl + ${letter} + ← => Rotate ${letter} left`);
      break;

    case 'Z-ArrowLeft':
      console.log(`Ctrl + ${letter} + ← => Rotate ${letter} left`);
      break;
    case 'X-ArrowRight':
      console.log(`Ctrl + ${letter} + ← => Rotate ${letter} left`);
      break;

    case 'Y-ArrowRight':
      console.log(`Ctrl + ${letter} + ← => Rotate ${letter} left`);
      break;
    case 'Z-ArrowRight':
      console.log(`Ctrl + ${letter} + → => Rotate ${letter} right`);
      break;


    case 'M-ArrowUp':
      console.log(`Ctrl + ${letter} + ↑ => Speed D up`);
      speedUpdate(true)
      break;
    case 'M-ArrowDown':
      console.log(`Ctrl + ${letter} + ↓ => Speed D down`);
      speedUpdate(false)
      break;

    default:
      console.log('Unknown combo');
  }
}

////////////////////////////////////////////////////////////


function speedUpdate(isUp)
{
  if(isUp)
    stepMove = stepMove + stepUpdate;
  else
  stepMove = stepMove - stepUpdate;

  updateStepSize();
}


////////////////////////////////////////////////////////////


const axesStatus = document.getElementById('axes-status');
const stepSizeDisplay = document.getElementById('step-size-display');
const rotateStatus = document.getElementById('rotate-status');

function updateAxesStatus() {
  axesStatus.textContent = axesGroup.visible ? "Yes" : "No";
}

// Function to update stepMove size display
function updateStepSize() {
  stepSizeDisplay.textContent = stepMove.toFixed(2);
}

// Function to update rotate display
function updateRotateStatus() {
  rotateStatus.textContent = rotateDisabled ? "No" : "Yes";


   
}

////////////////////////////////////////////////////////////