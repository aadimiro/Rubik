class Cube {
    constructor() {
        this.state = null;
        this.orientationMatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // 3x3 identity matrix
    }

    async fetchState() {
        const response = await fetch('/cube/state');
        const data = await response.json();
        this.state = data.state;
        this.orientationMatrix = data.orientation;
        console.log('Fetched state:', this.state);
        console.log('Fetched orientation matrix:', this.orientationMatrix);
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
            R: 0xff0000,  // Red
            black: 0x000000
        };

        // Update the cube faces with the correct colors
        rubiksCube.children.forEach((cubie, index) => {
            const faceColors = this.getFaceColors(index);
            cubie.material.forEach((material, i) => {
                //console.log(`Setting face ${i} color: ${colorMap[faceColors[i]]}`);
                material.color.setHex(colorMap[faceColors[i]]);
            });
        });

        // Convert 3x3 orientation matrix to 4x4 matrix
        const orientationMatrix4x4 = [
            ...this.orientationMatrix[0], 0,
            ...this.orientationMatrix[1], 0,
            ...this.orientationMatrix[2], 0,
            0, 0, 0, 1
        ];

        // Apply the orientation matrix to the cube
        const matrix = new THREE.Matrix4().fromArray(orientationMatrix4x4);
        console.log('Applying orientation matrix:', matrix);

        // Validate the matrix before applying
        if (this.isValidMatrix(matrix)) {
            rubiksCube.setRotationFromMatrix(matrix);
        } else {
            console.error('Invalid orientation matrix:', matrix);
            this.logMatrix(matrix);
        }
    }

    isValidMatrix(matrix) {
        // Check if the matrix contains valid numbers
        for (let i = 0; i < 16; i++) {
            if (!isFinite(matrix.elements[i])) {
                return false;
            }
        }
        return true;
    }

    logMatrix(matrix) {
        // Log the matrix values for debugging
        console.log('Matrix values:');
        for (let i = 0; i < 16; i++) {
            console.log(`matrix.elements[${i}]: ${matrix.elements[i]}`);
        }
    }

    getFaceColors(cubieIndex) {
        //const faceColors = ['W', 'Y', 'B', 'G', 'O', 'R'];

        const faceColors = ['black', 'black', 'black', 'black', 'black', 'black'];

        // Map cubieIndex to its position on the cube
        const positions = [];
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    positions.push({ x, y, z });
                }
            }
        }

        const position = positions[cubieIndex];

        // Determine the colors based on the position and state
        if (position.z === -1) faceColors[5] = this.state.B[(position.y + 1) * 3 + (-position.x + 1)]; // Back face
        if (position.z === 1) faceColors[4] = this.state.F[(position.y + 1) * 3 + (-position.x + 1)]; // Front face
        if (position.y === -1) faceColors[3] = this.state.D[(-position.z + 1) * 3 + (position.x + 1)]; // Down face
        if (position.y === 1) faceColors[2] = this.state.U[(position.z + 1) * 3 + (position.x + 1)]; // Up face
        if (position.x === -1) faceColors[1] = this.state.L[(position.y + 1) * 3 + (position.z + 1)]; // Left face
        if (position.x === 1) faceColors[0] = this.state.R[(position.y + 1) * 3 + (-position.z + 1)]; // Right face

        return faceColors;
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

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

const cube = new Cube();
cube.fetchState();

let counterclockwisePressed = false;

document.addEventListener('keydown', function(event) {
    const key = event.key;

    if (key === "'" || key === "#") {
        counterclockwisePressed = true;
        return;
    }

    fetch('/cube/key-press', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: key, counterclockwise: counterclockwisePressed }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Cube state:', data.state);
            cube.fetchState(); // Fetch the updated state and re-render the cube
        } else {
            console.error('Error:', data.error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

document.addEventListener('keyup', function(event) {
    if (event.key === "'" || event.key === "#") {
        counterclockwisePressed = false;
    }
});

document.getElementById('mixButton').addEventListener('click', function() {
    fetch('/cube/shuffle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Shuffle sequence:', data.sequence);
            cube.fetchState(); // Fetch the updated state and re-render the cube
        } else {
            console.error('Error:', data.error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});