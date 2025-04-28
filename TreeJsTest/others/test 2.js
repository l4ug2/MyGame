import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.120.1/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(5, 10, 20);
camera.lookAt(5, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Grid
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

const blockSize = 1;
const worldWidth = 10;
const worldHeight = 20;

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

let currentPiece = createTetromino();
const dropSpeed = 500; // ms
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

// Controls
window.addEventListener('keydown', (e) => {
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
});
