import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export const Renderer = {
    init(scene, camera, rubiksCube, cube) {
        this.scene = scene;
        this.camera = camera;
        this.rubiksCube = rubiksCube;
        this.cube = cube; // Store the Cube instance
    },
    updateCubeState(state, orientationMatrix) {
        // Update cube rendering based on state and orientation
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
        this.rubiksCube.children.forEach((cubie, index) => {
            const faceColors = this.cube.getFaceColors(index); // Call getFaceColors from Cube instance
            cubie.material.forEach((material, i) => {
                material.color.setHex(colorMap[faceColors[i]]);
            });
        });
        
        // Convert 3x3 orientation matrix to 4x4 matrix
        const orientationMatrix4x4 = [
            ...orientationMatrix[0], 0,
            ...orientationMatrix[1], 0,
            ...orientationMatrix[2], 0,
            0, 0, 0, 1
        ];
        
        // Apply the orientation matrix to the cube
        const matrix = new THREE.Matrix4().fromArray(orientationMatrix4x4);
        console.log('Applying orientation matrix:', matrix);
        
        // Validate the matrix before applying
        if (this.isValidMatrix(matrix)) {
            this.rubiksCube.setRotationFromMatrix(matrix);
        } else {
            console.error('Invalid orientation matrix:', matrix);
            this.logMatrix(matrix);
        }
    },
    isValidMatrix(matrix) {
        // Check if the matrix contains valid numbers
        for (let i = 0; i < 16; i++) {
            if (!isFinite(matrix.elements[i])) {
                return false;
            }
        }
        return true;
    },
    logMatrix(matrix) {
        // Log the matrix values for debugging
        console.log('Matrix values:');
        for (let i = 0; i < 16; i++) {
            console.log(`matrix.elements[${i}]: ${matrix.elements[i]}`);
        }
    }
};


