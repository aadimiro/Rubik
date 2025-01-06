import { Renderer } from './renderer.js';

export class Cube {
    constructor() {
        this.state = null;
        this.orientationMatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // 3x3 identity matrix
        this.stateHistory = [];
        this.historyIndex = -1;
    }

    async fetchState() {
        const response = await fetch('/cube/state');
        const data = await response.json();
        this.state = data.state;
        this.orientationMatrix = data.orientation;
        console.log('Fetched state:', this.state);
        console.log('Fetched orientation matrix:', this.orientationMatrix);
        this.saveState();
        Renderer.updateCube(this.orientationMatrix);
        if (this.historyIndex > 0) {
            this.updateHint(); // Update hint based on the new state
        }
        
    }

    async sendKeyPress(key) {
        await fetch('/cube/key-press', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
        await this.fetchState(); // Fetch updated state
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

    saveState() {
        // Save the current state and orientation
        const currentState = {
            state: JSON.parse(JSON.stringify(this.state)),
            orientationMatrix: JSON.parse(JSON.stringify(this.orientationMatrix))
        };

        // Add the current state to the history
        if (this.historyIndex < this.stateHistory.length - 1) {
            this.stateHistory = this.stateHistory.slice(0, this.historyIndex + 1);
        }
        this.stateHistory.push(currentState);

        // Maintain a maximum of 30 states in the history
        if (this.stateHistory.length > 30) {
            this.stateHistory.shift();
        } else {
            this.historyIndex++;
        }
    }

    async undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const previousState = this.stateHistory[this.historyIndex];
            this.state = previousState.state;
            this.orientationMatrix = previousState.orientationMatrix;
            await this.setState(previousState.state, previousState.orientationMatrix);
            this.render();
            this.updateHint(); // Update hint based on the new state
        }
    }

    async redo() {
        if (this.historyIndex < this.stateHistory.length - 1) {
            this.historyIndex++;
            const nextState = this.stateHistory[this.historyIndex];
            this.state = nextState.state;
            this.orientationMatrix = nextState.orientationMatrix;
            await this.setState(nextState.state, nextState.orientationMatrix);
            this.render();
            this.updateHint(); // Update hint based on the new state
        }
    }

    async setState(state, orientationMatrix) {
        await fetch('/cube/set-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state, orientation: orientationMatrix })
        });
    }

    updateHint() {
        const hintText = document.getElementById('hintText');
        if (!this.isWhiteCross()) {
            hintText.textContent = 'Hint: Make a white cross. You just need simple moves, give it a try!';
        } else if (!this.isFirstLayerComplete()) {
            hintText.textContent = 'Hint: Complete the first layer with white face. Use the [Rotate Corner ...] and ' +
                                   '[Insert corner...] moves as help';
        } else if (!this.isFirstTwoLayersComplete()) {
            hintText.textContent = 'Hint: Complete the first two layers. Use the [Auto Move ...] moves as ' +
                                   'help to insert the edges';
        } else if (!this.isLastLayerYellow()) {
            hintText.textContent = 'Hint: Complete the last yellow face. Use the [Line to fish ...] and ' +
                                   '[Corner to fish ...] moves as help first to build a yellow fish. ' +
                                   'Then the [Fish to yellow] move to get a yellow last layer';
        } else if (!this.isLastLayerCorrect()) {
            hintText.textContent = 'Hint: Solve the last layer. Use the [Rotate 3 edges ...] move first to ' +
                                    'fix the edges, finally the [Rotate 3 corners ...] move fix the corners.' +
                                    'Finally just rotate the last face to solve the cube';
        } else {
            hintText.textContent = 'Congratulations! You solved the cube!';
        }
    }

    isWhiteCross() {
        // Check if the white cross is present on the top face
        const U = this.state.U;
        return U[1] === 'W' && U[3] === 'W' && U[5] === 'W' && U[7] === 'W';
    }

    isFirstLayerComplete() {
        // Check if the first layer with the white face is complete
        const U = this.state.U;
        const F = this.state.F;
        const R = this.state.R;
        const B = this.state.B;
        const L = this.state.L;
        return this.isWhiteCross() &&
            U[0] === 'W' && U[2] === 'W' && U[6] === 'W' && U[8] === 'W' &&
            F[8] === 'G' && F[6] === 'G' && 
            R[8] === 'R' && R[6] === 'R' &&
            B[8] === 'B' && B[6] === 'B' &&
            L[6] === 'O' && L[6] === 'O' ;
    }

    isFirstTwoLayersComplete() {
        // Check if the first two layers are complete
        const F = this.state.F;
        const R = this.state.R;
        const B = this.state.B;
        const L = this.state.L;
        return this.isFirstLayerComplete() &&
            F[5] === 'G' && F[7] === 'G' && 
            R[5] === 'R' && R[7] === 'R' &&
            B[5] === 'B' && B[7] === 'B' &&
            L[5] === 'O' && L[7] === 'O' ;
    }

    isLastLayerYellow() {
        // Check if the last layer has a yellow face
        const D = this.state.D;
        return this.isFirstTwoLayersComplete() &&
            D[0] === 'Y' && D[2] === 'Y' && D[6] === 'Y' && D[8] === 'Y' &&
            D[1] === 'Y' && D[3] === 'Y' && D[5] === 'Y' && D[7] === 'Y';
    }

    isLastLayerCorrect() {
        // Check if the last layer is solved
        const F = this.state.F;
        const R = this.state.R;
        const B = this.state.B;
        const L = this.state.L;
        return this.isLastLayerYellow() &&
            F[0] === 'G' && F[1] === 'G' && F[2] === 'G' && 
            R[0] === 'R' && R[1] === 'R' && R[2] === 'R' &&
            B[0] === 'B' && B[1] === 'B' && B[2] === 'B' &&
            L[0] === 'O' && L[1] === 'O' && L[2] === 'O';
    }
}