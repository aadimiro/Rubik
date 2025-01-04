import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { Cube } from './cube.js';
import { Renderer } from './renderer.js';
import { EventHandler } from './eventHandler.js';

// Setup Three.js
const threeCanvas = document.getElementById('cubeCanvas');
const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas });
renderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, threeCanvas.clientWidth / threeCanvas.clientHeight, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(0, 0, 0);

// Add lighting to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

const cubieSize = 0.9;
const rubiksCube = new THREE.Group();

for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
            const geometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);
            const materials = Array(6).fill().map(() => new THREE.MeshBasicMaterial({ color: 0x000000 }));
            const cubie = new THREE.Mesh(geometry, materials);
            cubie.position.set(x, y, z);
            rubiksCube.add(cubie);
        }
    }
}
scene.add(rubiksCube);

// Initialize Cube
const cube = new Cube();

// Initialize Renderer with the Cube instance
Renderer.init(scene, camera, rubiksCube, cube);

cube.fetchState().then(() => {
    // Ensure the cube state is fetched before starting the render loop
    animate();
});

// Initialize Event Handlers
EventHandler.init(cube, Renderer.animateMove.bind(Renderer));


// Render Loop
let lastTime = performance.now();
function animate(time) {
    requestAnimationFrame(animate);
    const delta = (time - lastTime) / 1000; // Time in seconds since last frame
    lastTime = time;
    Renderer.updateAnimation(delta);
    renderer.render(scene, camera);
}
