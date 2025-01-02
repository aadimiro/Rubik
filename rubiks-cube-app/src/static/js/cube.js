import { Renderer } from './renderer.js';

export class Cube {
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
        Renderer.updateCubeState(this.state, this.orientationMatrix);
    }

    getFaceColors(cubieIndex) {
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