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
                console.log(`Setting face ${i} color: ${colorMap[faceColors[i]]}`);
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
        const faceColors = ['W', 'Y', 'B', 'G', 'O', 'R'];
        if (cubieIndex === 26) {
            faceColors[1] = "black";
            faceColors[3] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 25) {
            faceColors[1] = "black";
            faceColors[3] = "black";
            faceColors[4] = "black";
            faceColors[5] = "black";            
        }
        if (cubieIndex === 24) {
            faceColors[1] = "black";
            faceColors[3] = "black";
            faceColors[4] = "black";
        }
        if (cubieIndex === 23) {
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[3] = "black";
            faceColors[5] = "black";                
        }
        if (cubieIndex === 22) {
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[3] = "black";
            faceColors[4] = "black";    
            faceColors[5] = "black";
        }
        if (cubieIndex === 21) {
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[3] = "black";
            faceColors[4] = "black";    
        }        
        if (cubieIndex === 20) {
            faceColors[1] = "black";
            faceColors[5] = "black";
            faceColors[2] = "black";
        }
        if (cubieIndex === 19) {
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[4] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 18) {
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[4] = "black";

        }
        if (cubieIndex === 17) {
            faceColors[0] = "black";
            faceColors[1] = "black";
            faceColors[3] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 16) {
            faceColors[0] = "black";
            faceColors[1] = "black";
            faceColors[3] = "black";
            faceColors[4] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 15) {
            faceColors[0] = "black";
            faceColors[1] = "black";
            faceColors[3] = "black";
            faceColors[4] = "black";
        }
        if (cubieIndex === 14) {
            faceColors[0] = "black";
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[3] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 13) {
            faceColors[0] = "black";
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[4] = "black";
            faceColors[3] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 12) {
            faceColors[0] = "black";
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[4] = "black";
            faceColors[3] = "black";
        }
        if (cubieIndex === 11) {
            faceColors[0] = "black";
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 10) {
            faceColors[0] = "black";
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[4] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 9) {
            faceColors[0] = "black";
            faceColors[1] = "black";
            faceColors[2] = "black";
            faceColors[4] = "black";
        }
        if (cubieIndex === 8) {
            faceColors[0] = "black";
            faceColors[3] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 7) {
            faceColors[0] = "black";
            faceColors[3] = "black";
            faceColors[4] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 6) {
            faceColors[0] = "black";
            faceColors[3] = "black";
            faceColors[4] = "black";
        }
        if (cubieIndex === 5) {
            faceColors[0] = "black";
            faceColors[2] = "black";
            faceColors[3] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 4) {
            faceColors[0] = "black";
            faceColors[2] = "black";
            faceColors[3] = "black";
            faceColors[4] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 3) {
            faceColors[0] = "black";
            faceColors[2] = "black";
            faceColors[3] = "black";
            faceColors[4] = "black";
        }
        if (cubieIndex === 2) {
            faceColors[0] = "black";
            faceColors[2] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 1) {
            faceColors[0] = "black";
            faceColors[2] = "black";
            faceColors[4] = "black";
            faceColors[5] = "black";
        }
        if (cubieIndex === 0) {
            faceColors[0] = "black";
            faceColors[2] = "black";
            faceColors[4] = "black";
        }
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

document.addEventListener('keydown', (event) => {
    cube.sendKeyPress(event.key);
});