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
const lineStatus = document.getElementById('line-status');

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Camera Position
var camera_px = 0;   // ( riht - left )
var camera_py = 1;  // ( up - down )
var camera_pz = 5;  // ( front - back )

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

// Poles Variables
let polesGroup = null;

// Grass Variables
let grassGroup = null;
let grassCamera = null;

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

const distView = 5;
const distStep = 0.125; //- 1/8 din 1 unitate

const pi = Math.PI;
const angle = pi/16; //- 1/8 din 90 grade Pi/2 relative to x+ axes

var angleDirection = 0;
var angleAzimuth = 0;

////////////////////////////////////////////////////////////

function MoveVector3 (original, isForward)
{ 
  //:THREE.Vector3 
  var response = new THREE.Vector3();

  var original_x = original.x; // orizontala
  var original_z = original.z; // profunzime
  var original_y = original.y; // verticala - o sa ramana fix momentan

  var distance = distStep * (isForward ? 1 : -1); 
    
  // forward is -z axes 
  // backward is +z axes
  
  // var angleRelative = 2*pi - angleDirection;
  var angleRelative = angleDirection;

  // var response_x = original_x + distance*Math.sin(angleRelative);
  // var response_z = original_z + distance*Math.cos(angleRelative);
  var response_x = original_x + distance*Math.sin(angleRelative);
  var response_z = original_z - distance*Math.cos(angleRelative);
  var response_y = original_y;

  response.x = response_x;
  response.y = response_y;
  response.z = response_z;

  return response;
}

////////////////////////////////////////////////////////////

function RotateVector3 (original, customDist, angle)
{
  //:THREE.Vector3
  var response = new THREE.Vector3();

  var original_x = original.x; // orizontala
  var original_z = original.z; // profunzime
  var original_y = original.y; // verticala - o sa ramana fix momentan

  var distance = customDist ? customDist : distView;
    
  // right is turn to +x axes more angle 
  // left is turn to -x axes less angle 

  // var angleRelative = 2*pi - angleDirection;
  var angleRelative = angleDirection + (angle ? angle : 0);

  // var response_x = original_x + distance*Math.sin(angleRelative);
  // var response_z = original_z + distance*Math.cos(angleRelative);
  var response_x = original_x + distance*Math.sin(angleRelative);
  var response_z = original_z - distance*Math.cos(angleRelative);
  var response_y = original_y;

  response.x = response_x;
  response.y = response_y;
  response.z = response_z;

  return response;
}

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
const gridHelper = new THREE.GridHelper(500, 500);
scene.add(gridHelper);

// Light Setup
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

////////////////////////////////////////////////////////////

var texture_eye = new THREE.TextureLoader().load( 'materials/blue.jpg' );
const geometry_eye = new THREE.SphereGeometry( 0.25, 12, 12 ); 
// const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
const material_eye = new THREE.MeshBasicMaterial( { map: texture_eye } ); 
const eye = new THREE.Mesh( geometry_eye, material_eye ); 
eye.position.set(camera_vx, camera_vy, camera_vz);
scene.add( eye );

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

var _vectorline;

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

  _vectorline = line;
}

////////////////////////////////////////////////////////////

function adjustVectorViewCamera(offsetx, offsety, offsetz)
{
  if(!offsetx) offsetx = 0;
  if(!offsety) offsety = 0;
  if(!offsetz) offsetz = 0;  

  _vectorline.geometry.vertices[0]=new THREE.Vector3(camera_vx, camera_vy , camera_vz);
  _vectorline.geometry.vertices[1]=new THREE.Vector3(camera_px + offsetx, camera_py + offsety, camera_pz + offsetz);
  
  _vectorline.geometry.verticesNeedUpdate = true;
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

var _meshline;
var _mesh;

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

  _meshline = line;
  _mesh = mesh;
}

////////////////////////////////////////////////////////////

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
  
  _meshline.setGeometry(new THREE.BufferGeometry().setFromPoints(newPoints));
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

  addCubesCamera();
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

// Update line display
function updateLineStatus() {
  lineStatus.textContent = _mesh.visible ? "Yes" : "No";
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Axes Generate Once
function addAxesArrows() {
  axesGroup = new THREE.Group();
  const boxSize = 0.125;
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

// Cube Generate Once = Grass, Randomize, Arround
function addCubes() {
  grassGroup = new THREE.Group();
  
  const count = 25;
  let size = 0.25;

  const grassLoader = new THREE.TextureLoader();
  const grassMaterials = [
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassSides.jpg') }), //right side
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassSides.jpg')}), //left side
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassTop.jpg')}), //top side
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassBottom.jpg')}), //bottom side
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassSides.jpg')}), //front side
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassSides.jpg')}), //back side
  ];

  let grassGeometry = new THREE.BoxGeometry(size, size, size);
  let grassCube = new THREE.Mesh(grassGeometry, grassMaterials);
 
  const earthLoader = new THREE.TextureLoader();
  const earthMaterial = new THREE.MeshBasicMaterial({ map: earthLoader.load('/materials/grass/GrassBottom.jpg')});
  
  let earthGeometry = new THREE.BoxGeometry(size, size, size);
  let earthCube = new THREE.Mesh(earthGeometry, earthMaterial);

  let splitVariant = [
    {x:0.00, z:0.00, y:0},
    {x:0.00, z:0.25, y:0},
    {x:0.00, z:0.50, y:0},
    {x:0.00, z:0.75, y:0},

    {x:0.25, z:0.00, y:0},
    {x:0.25, z:0.25, y:0},
    {x:0.25, z:0.50, y:0},
    {x:0.25, z:0.75, y:0},

    {x:0.50, z:0.00, y:0},
    {x:0.50, z:0.25, y:0},
    {x:0.50, z:0.50, y:0},
    {x:0.50, z:0.75, y:0},

    {x:0.75, z:0.00, y:0},
    {x:0.75, z:0.25, y:0},
    {x:0.75, z:0.50, y:0},
    {x:0.75, z:0.75, y:0},
  ];

  let quaterVariant = [
    {x:(+1), z:(+1), y:(+1)},
    {x:(+1), z:(-1), y:(+1)},
    {x:(-1), z:(+1), y:(+1)},
    {x:(-1), z:(-1), y:(+1)},
  ];

  for (let evolution_x = 0; evolution_x <= count;  evolution_x = evolution_x+1) {
    for (let evolution_z = 0; evolution_z <= count; evolution_z = evolution_z+1) { 

      quaterVariant.forEach(quater => {
        splitVariant.forEach(split => {

          const random = Math.floor(Math.random() * 4) + 1;          
          for (let index = 0; index < random; index++) {

            let grass_x = evolution_x*quater.x + split.x + size/2;
            let grass_z = evolution_z*quater.z + split.z + size/2;

            let grass_y = size*index;

            if(index == random-1)
            {
              const grassClone = grassCube.clone(true);   
              grassClone.position.set(grass_x, grass_y, grass_z);
              grassCamera.add(grassClone); 
            }
            else
            {
              const earthClone = earthCube.clone(true);  
              earthClone.position.set(grass_x, grass_y, grass_z);
              grassCamera.add(earthClone); 
            }
          } 

        });
      });

    }
  }
  
  scene.add(grassGroup);
}

// Cube Generate Camera = Grass, Randomize, Arround
function addCubesCamera()
{
  scene.remove(grassCamera);
  grassCamera = new THREE.Group();
  
  let size = 1;

  const grassLoader = new THREE.TextureLoader();
  const grassMaterials = [
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassSides.jpg') }), //right side
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassSides.jpg')}), //left side
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassTop.jpg')}), //top side
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassBottom.jpg')}), //bottom side
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassSides.jpg')}), //front side
      new THREE.MeshBasicMaterial({ map: grassLoader.load('/materials/grass/GrassSides.jpg')}), //back side
  ];
  
  let grassGeometry = new THREE.BoxGeometry(size, size, size);
  let grassCube = new THREE.Mesh(grassGeometry, grassMaterials);

  const earthLoader = new THREE.TextureLoader();
  const earthMaterial = new THREE.MeshBasicMaterial({ map: earthLoader.load('/materials/grass/GrassBottom.jpg')});
  
  let earthGeometry = new THREE.BoxGeometry(size, size, size);
  let earthCube = new THREE.Mesh(earthGeometry, earthMaterial);

  let angleVariant = [
    pi/2,
    3*pi/2,
  ];

  //pe directia camera->view * 5 lenght
  for(let evolution = 0; evolution <= distView*5; evolution = evolution + size)
  {
     var camera_view = new THREE.Vector3(camera_px,camera_py,camera_pz);
     var direction_view = RotateVector3(camera_view, evolution);

     //randomStackCubes(size, 1, direction_view, grassCube, earthCube, grassCamera);
     randomHeigthCubes(size, 1, direction_view, grassMaterials, grassCamera);

     //pe directia perpendiculara camera->view
     for(let revolution = size; revolution <= evolution; revolution = revolution + size)
     {
        angleVariant.forEach(angle => {
          var position_view = RotateVector3(direction_view, revolution, angle);

          //randomStackCubes(size, 1, position_view, grassCube, earthCube, grassCamera);
          randomHeigthCubes(size, 1, position_view, grassMaterials, grassCamera);
        }
      );
    }
  }

  scene.add(grassCamera);
}

function randomStackCubes(size, stack, position, topElement, underElement, group)
{
  const random = Math.floor(Math.random() * stack) + 1;          
  for (let index = 0; index < random; index++) 
  {
    let element_x = position.x;
    let element_z = position.z;

    let element_y = size*index;    
    
    let cloneElement;
    if(index == random-1)
    {
      cloneElement = topElement.clone(true); 
    }
    else
    {
      cloneElement = underElement.clone(true);           
    }

    cloneElement.position.set(element_x, element_y, element_z);
    group.add(cloneElement); 
  }
}


function randomHeigthCubes(size, height, position, material, group)
{
  const random = Math.random() * height + 1;          
  
  let element_x = position.x;
  let element_z = position.z;

  let element_y = 0;       

  let cloneGeometry = new THREE.BoxGeometry(size, size*random, size);
  let cloneElement = new THREE.Mesh(cloneGeometry, material);

  // let cloneElement = topElement.clone(true); 
  // cloneElement.geometry.height = size*random;
  
  cloneElement.position.set(element_x, element_y, element_z);
  group.add(cloneElement); 
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Poles Generate Once
function addPoles() {
  polesGroup = new THREE.Group();

  const count = 250;
  const height = 10;

  var texture_ocean = new THREE.TextureLoader().load( 'materials/ocean.jpg' );
  var texture_sauron = new THREE.TextureLoader().load( 'materials/sauron.jpg' );

  const material_ocean = new THREE.MeshBasicMaterial( { map: texture_ocean } ); 
  const material_sauron  = new THREE.MeshBasicMaterial( { map: texture_sauron } ); 

  for (let i = 0; i <= count; i = i+5) {
      const geometry = new THREE.BoxGeometry(1, height, 1, 3, height*3, 3);    
      const box = new THREE.Mesh(geometry, (i%2==0) ? material_ocean : material_sauron);

      const box1 = box.clone(true); // quadran +x+z
      const box2 = box.clone(true); // quadran +x-z
      const box3 = box.clone(true); // quadran -x+z
      const box4 = box.clone(true); // quadran -x-z

      box1.position.set(i,height/2,i);
      box2.position.set(i,height/2,-i);
      box3.position.set(-i,height/2,i);
      box4.position.set(-i,height/2,-i);
            
      polesGroup.add(box1);
      polesGroup.add(box2);
      polesGroup.add(box3);
      polesGroup.add(box4);
    } 

  scene.add(polesGroup);
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

function animate() {
  requestAnimationFrame(animate); 

  renderer.render(scene, camera);
}

animate();

addPoles();
addAxesArrows();
displayCameraInfo();

//addCubes();
addCubesCamera();

drawVectorViewCamera(0,-1,0);
drawMeshViewCamera(0,-2,0);

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Events Axes On/Off
window.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.code === 'KeyA') {
    e.preventDefault();
    axesGroup.visible = !axesGroup.visible;
    polesGroup.visible = !polesGroup.visible;
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

// Events Line On/Off
window.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.code === 'KeyL') {
    e.preventDefault();
    _mesh.visible = !_mesh.visible;
    _meshline.visible = !_meshline.visible;
    _vectorline.visible = !_vectorline.visible;
    updateLineStatus();
  }  
});

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Events Move Angle
window.addEventListener('keydown', (e) => {
  
  if (e.code === 'ArrowUp') {
    e.preventDefault();
    moveCamera(true);
  }  
  else if (e.code === 'ArrowDown') {
    e.preventDefault();
    moveCamera(false);
  }  

  else if (e.code === 'ArrowRight') {
    e.preventDefault();
    rotateView(true);
  }  
  else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    rotateView(false);
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

function moveCamera(isForward)
{
  var original_cam = new THREE.Vector3(camera_px,camera_py,camera_pz);
  var response_cam = MoveVector3(original_cam, isForward); //translate on the same angle

  var original_view = new THREE.Vector3(camera_vx,camera_vy,camera_vz);
  var response_view = MoveVector3(original_view, isForward); //translate on the same angle
  
  camera_px = response_cam.x;
  //camera_py = response_cam.y;
  camera_pz = response_cam.z;

  camera_vx = response_view.x;
  //camera_vy = response_view.y;
  camera_vz = response_view.z;

  updateCameraPosition();
}

////////////////////////////////////////////////////////////

function rotateView(isClockwise)
{
  angleDirection = angleDirection + angle * ( isClockwise ? 1 : -1 );

  var original_view = new THREE.Vector3(camera_px,camera_py,camera_pz);
  var response_view = RotateVector3(original_view); //rotate on new angle
  
  camera_vx = response_view.x;
  //camera_vy = response_view.y;
  camera_vz = response_view.z;

  updateCameraPosition();
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// Events Move On/Off
window.addEventListener('keydown', (e) => {
  return;

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

////////////////////////////////////////////////////////////

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


