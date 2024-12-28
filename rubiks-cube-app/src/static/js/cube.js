class Cube {
    constructor() {
        this.state = null;
        this.orientation = { x: 0, y: 0, z: 0 }; // Orientation in degrees
    }

    async fetchState() {
        const response = await fetch('/cube/state');
        const data = await response.json();
        this.state = data.state;
        this.orientation = data.orientation;
        this.render();
    }

    async sendKeyPress(key) {
        await fetch('/cube/key-press', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
        await this.fetchState(); // Fetch updated state
    }

    render() {
        const colorMap = {
            W: 0xffffff, // White
            Y: 0xffff00, // Yellow
            B: 0x0000ff, // Blue
            G: 0x00ff00, // Green
            O: 0xffa500, // Orange
            R: 0xff0000  // Red
        };

        rubiksCube.children.forEach((cubie, index) => {
            const faceColors = this.getFaceColors(index);
            cubie.material.forEach((material, i) => {
                material.color.setHex(colorMap[faceColors[i]]);
            });
        });

        rubiksCube.rotation.x = THREE.Math.degToRad(this.orientation.x);
        rubiksCube.rotation.y = THREE.Math.degToRad(this.orientation.y);
        rubiksCube.rotation.z = THREE.Math.degToRad(this.orientation.z);
    }

    getFaceColors(cubieIndex) {
        // Return the colors for the faces of a given cubie (logic depends on your cube mapping)
        return ['W', 'Y', 'B', 'G', 'O', 'R']; // Example order
    }
}

const threeCanvas = document.getElementById('cubeCanvas');
const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas });
renderer.setSize(threeCanvas.clientWidth, threeCanvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, threeCanvas.clientWidth / threeCanvas.clientHeight, 0.1, 1000);
camera.position.set(3, 3, 3);
camera.lookAt(0, 0, 0);

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

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

const cube = new Cube();
cube.fetchState();

document.addEventListener('keydown', (event) => {
    cube.sendKeyPress(event.key);
});
