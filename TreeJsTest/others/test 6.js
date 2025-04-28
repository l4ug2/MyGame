////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.120.1/build/three.module.js';
// import * as MESHLINE from 'https://cdn.jsdelivr.net/npm/three.meshline@1.4.0/src/THREE.MeshLine.js';

// import * as THREE from './three.module.js';
// import * as MESHLINE from './three.meshLine.js';

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Camera Info Element
const camInfoDiv = document.getElementById('cam-info');
const viewInfoDiv = document.getElementById('view-info');

// Others Info Element
const axesStatus = document.getElementById('axes-status');
const rotateStatus = document.getElementById('rotate-status');

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Camera Position
var camera_px = 0;   // ( riht - left )
var camera_py = 10;  // ( up - down )
var camera_pz = 20;  // ( front - back )

// Camera View
var camera_vx = 0;
var camera_vy = 0;
var camera_vz = 0;

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Rotate update toggle
var rotateDisabled = false;

// Draw vector;
var viewCameraVector = true;

// Step size for movement
var stepMove = 1;  

// Axes Variables
let axesGroup = null;

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(camera_px, camera_py, camera_pz);
camera.lookAt(camera_vx, camera_vy, camera_vz);

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

var texture_eye = new THREE.TextureLoader().load( 'materials/blue.jpg' );
const geometry_eye = new THREE.SphereGeometry( 1, 6, 6 ); 
// const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
const material_eye = new THREE.MeshBasicMaterial( { map: texture_eye } ); 
const eye = new THREE.Mesh( geometry_eye, material_eye ); 
eye.position.set(camera_vx, camera_vy, camera_vz);
scene.add( eye );

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

var vectorline;

function drawVectorViewCamera(offsetx, offsety, offsetz)
{
  if(!offsetx) offsetx = 0;
  if(!offsety) offsety = 0;
  if(!offsetz) offsetz = 0;
  
  var geometry_line = new THREE.Geometry();
  geometry_line.vertices.push(new THREE.Vector3(camera_vx, camera_vy , camera_vz));
  geometry_line.vertices.push(new THREE.Vector3(camera_px + offsetx, camera_py + offsety, camera_pz + offsetz));
  
  var material_line = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 1 } );
  
  var line = new THREE.Line(geometry_line, material_line);
  scene.add(line);

  vectorline = line;
}

function adjustVectorViewCamera(offsetx, offsety, offsetz)
{
  if(!offsetx) offsetx = 0;
  if(!offsety) offsety = 0;
  if(!offsetz) offsetz = 0;  

  vectorline.geometry.vertices[0]=new THREE.Vector3(camera_vx, camera_vy , camera_vz);
  vectorline.geometry.vertices[1]=new THREE.Vector3(camera_px + offsetx, camera_py + offsety, camera_pz + offsetz);
  
  vectorline.geometry.verticesNeedUpdate = true;
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

var meshline;

function drawMeshViewCamera(offsetx, offsety, offsetz)
{
  if(!offsetx) offsetx = 0;
  if(!offsety) offsety = 0;
  if(!offsetz) offsetz = 0;

  const start = new THREE.Vector3(camera_vx, camera_vy, camera_vz);
  const end = new THREE.Vector3(camera_px + offsetx, camera_py + offsety, camera_pz + offsetz);

  const points = [start, end];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const line = new MeshLine();
  line.setGeometry(geometry);
  
  const material = new MeshLineMaterial({
    color: new THREE.Color(0x0000ff),
    lineWidth: 0.1, // Adjust width (in world units)
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    sizeAttenuation: 1, // line width perspective scaling
  });

  const mesh = new THREE.Mesh(line, material);
  scene.add(mesh);

  meshline = line;
}

function adjustMeshViewCamera(offsetx, offsety, offsetz)
{
  if(!offsetx) offsetx = 0;
  if(!offsety) offsety = 0;
  if(!offsetz) offsetz = 0;

  const newPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(camera_vx, camera_vy , camera_vz),
    new THREE.Vector3(camera_px + offsetx, camera_py + offsety, camera_pz + offsetz)
  ];
  
  meshline.setGeometry(new THREE.BufferGeometry().setFromPoints(newPoints));
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Update camera position 
function updateCameraPosition()
{
  camera.position.set(camera_px, camera_py, camera_pz);
  camera.lookAt(camera_vx, camera_vy, camera_vz);

  eye.position.set(camera_vx, camera_vy, camera_vz);
  
  adjustVectorViewCamera(0,-1,0)
  adjustMeshViewCamera(0,-2,0)

  displayCameraInfo();
}

// Update camera display
function displayCameraInfo()
{ 
  camInfoDiv.innerText = `Camera Position:\nX: ${camera_px.toFixed(2)}\nY: ${camera_py.toFixed(2)}\nZ: ${camera_pz.toFixed(2)}`;
  viewInfoDiv.innerText = `View Position:\nX: ${camera_vx.toFixed(2)}\nY: ${camera_vy.toFixed(2)}\nZ: ${camera_vz.toFixed(2)}`;
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Update axesStatus display
function updateAxesStatus() {
  axesStatus.textContent = axesGroup.visible ? "Yes" : "No";
}

// Update rotate display
function updateRotateStatus() {
  rotateStatus.textContent = rotateDisabled ? "No" : "Yes";
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Axes Generate Once
function addAxesArrows(scene) {
  axesGroup = new THREE.Group();
  const boxSize = 0.5;
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
////////////////////////////////////////////////////////////

function animate() {
  requestAnimationFrame(animate); 

  renderer.render(scene, camera);
}

animate();

addAxesArrows(scene);
displayCameraInfo();

drawVectorViewCamera(0,-1,0);
drawMeshViewCamera(0,-2,0);

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Events Axes On/Off
window.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.code === 'KeyA') {
    e.preventDefault();
    axesGroup.visible = !axesGroup.visible;
    updateAxesStatus();
  }
});

////////////////////////////////////////////////////////////

// Events Rotate On/Off
window.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.code === 'KeyR') {
    e.preventDefault();
    rotateDisabled = !rotateDisabled;
    updateRotateStatus();
  }  
});

////////////////////////////////////////////////////////////

// Events Move On/Off
window.addEventListener('keydown', (e) => {
  console.log(e.code + "   ---    Is Pressed !!!");

  if (e.code === 'ArrowUp') {
    e.preventDefault();
    handleCameraMovement('Z', false);
  }  
  else if (e.code === 'ArrowDown') {
    e.preventDefault();
    handleCameraMovement('Z', true);
  }  

  else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    handleCameraMovement('X', false);
  }  
  else if (e.code === 'ArrowRight') {
    e.preventDefault();
    handleCameraMovement('X', true);
  }  

  else if (e.code === 'PageUp') {
    e.preventDefault();
    handleCameraMovement('Y', true);
  }  
  else if (e.code === 'PageDown') {
    e.preventDefault();
    handleCameraMovement('Y', false);
  }  
});

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

const keysPressed = {};

window.addEventListener('keydown', (e) => {
  return;

  keysPressed[e.code] = true;

  if (e.shiftKey) {
    const mainKey = ['KeyX', 'KeyY', 'KeyZ'].find(k => keysPressed[k]);
    const arrowKey = ['ArrowUp', 'ArrowDown'].find(k => keysPressed[k]);

    if (mainKey && arrowKey) {
      handleCombo(mainKey, arrowKey);
    }
  }
});

window.addEventListener('keyup', (e) => {
  return;

  keysPressed[e.code] = false;
});

////////////////////////////////////////////////////////////

function handleCombo(letterKey, arrowKey) {
  const letter = letterKey.replace('Key', ''); 
   
  switch (`${letter}-${arrowKey}`) {

    case 'X-ArrowUp':
      console.log('Shift + X + ↑ => Move X up');
      handleCameraMovement(letter, true);
      break;
    case 'X-ArrowDown':
      console.log('Shift + X + ↓ => Move X down');
      handleCameraMovement(letter, false);
      break;

    case 'Y-ArrowUp':
      console.log('Shift + Y + ↑ => Move Y up');
      handleCameraMovement(letter, true);
      break;
    case 'Y-ArrowDown':
      console.log('Shift + Y + ↓ => Move Y down');
      handleCameraMovement(letter, false);
      break;

    case 'Z-ArrowUp':
      console.log('Shift + Z + ↑ => Move Z up');
      handleCameraMovement(letter, true);
      break;
    case 'Z-ArrowDown':
      console.log('Shift + Z + ↓ => Move Z down');
      handleCameraMovement(letter, false);
      break;
    
    default:
      console.log('Unknown combo');
  }
}

////////////////////////////////////////////////////////////

function handleCameraMovement(letter, isUp, stepSize) {
  stepMove = stepSize || stepMove;
 
  switch (letter) {
    case 'X':
      camera_px += isUp ? stepMove : -stepMove;
      if (rotateDisabled) camera_vx += isUp ? stepMove : -stepMove; 
      break;
    case 'Y':
      camera_py += isUp ? stepMove : -stepMove;
      if (rotateDisabled) camera_vy += isUp ? stepMove : -stepMove; 
      break;
    case 'Z':
      camera_pz += isUp ? stepMove : -stepMove;
      if (rotateDisabled) camera_vz += isUp ? stepMove : -stepMove; 
      break;
    default:
      console.log('Invalid axis specified');
      return;
  }

  updateCameraPosition();
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
