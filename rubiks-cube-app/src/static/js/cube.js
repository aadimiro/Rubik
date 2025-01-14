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
        Renderer.updateCube();
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


    getFaceColors(x, y, z) {
        const faceColors = ['black', 'black', 'black', 'black', 'black', 'black'];

        // Determine the real face (U, D, F, B, L, R) which is at corresponding side depending on the orientation
        const orientation = this.orientationMatrix;

        // Determine the real faces based on the orientation matrix
        const realR = orientation[0][0] === 1 ? 'R' : orientation[0][0] === -1 ? 'L' :
                    orientation[0][1] === 1 ? 'D' : orientation[0][1] === -1 ? 'U' :
                    orientation[0][2] === 1 ? 'B' : 'F';

        const realU = orientation[1][0] === 1 ? 'L' : orientation[1][0] === -1 ? 'R' :
                    orientation[1][1] === 1 ? 'U' : orientation[1][1] === -1 ? 'D' :
                    orientation[1][2] === 1 ? 'B' : 'F';

        const realF = orientation[2][0] === 1 ? 'L' : orientation[2][0] === -1 ? 'R' :
                    orientation[2][1] === 1 ? 'D' : orientation[2][1] === -1 ? 'U' :
                    orientation[2][2] === 1 ? 'F' : 'B';

        // Determine the opposite faces
        const realL = realR === 'R' ? 'L' : realR === 'L' ? 'R' :
                    realR === 'U' ? 'D' : realR === 'D' ? 'U' :
                    realR === 'F' ? 'B' : 'F';

        const realD = realU === 'U' ? 'D' : realU === 'D' ? 'U' :
                    realU === 'R' ? 'L' : realU === 'L' ? 'R' :
                    realU === 'F' ? 'B' : 'F';

        const realB = realF === 'F' ? 'B' : realF === 'B' ? 'F' :
                    realF === 'R' ? 'L' : realF === 'L' ? 'R' :
                    realF === 'U' ? 'D' : 'U';
        
        // Determine the colors based on the position and state
        if (z === -1) faceColors[5] = this.state[realB][(y + 1) * 3 + (-x + 1)]; // Back face
        if (z === 1) faceColors[4] = this.state[realF][(y + 1) * 3 + (-x + 1)]; // Front face
        if (y === -1) faceColors[3] = this.state[realD][(-z + 1) * 3 + (x + 1)]; // Down face
        if (y === 1) faceColors[2] = this.state[realU][(z + 1) * 3 + (x + 1)]; // Up face
        if (x === -1) faceColors[1] = this.state[realL][(y + 1) * 3 + (z + 1)]; // Left face
        if (x === 1) faceColors[0] = this.state[realR][(y + 1) * 3 + (-z + 1)]; // Right face

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