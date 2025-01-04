import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export const Renderer = {
    init(scene, camera, rubiksCube, cube) {
        this.scene = scene;
        this.camera = camera;
        this.rubiksCube = rubiksCube;
        this.cube = cube; // Store the Cube instance
        this.animating = false;
        this.animationProgress = 0;
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
    animateRightFace() {
        if (this.animating) return;
        this.animating = true;
        this.animationProgress = 0;
    },
    updateAnimation(delta) {
        if (!this.animating) return;
    
        const speed = Math.PI / 2; // Rotation speed in radians per second
        this.animationProgress += delta * speed;
    
        if (this.animationProgress >= Math.PI / 2) {
            this.animationProgress = Math.PI / 2;
            this.animating = false;
        }
    
        // Calculate the current rotation angle
        const angle = this.animationProgress;
    
        // Persistent pivot for the right face
        if (!this.pivot) {
            this.pivot = new THREE.Object3D();
            this.scene.add(this.pivot);
    
            // Find all cubies that belong to the right face and add them to the pivot
            const rightFaceCubies = this.rubiksCube.children.filter(cubie => cubie.position.x > 0.9);
            rightFaceCubies.forEach(cubie => {
                this.pivot.add(cubie);
            });
        }
    
        // Apply rotation to the pivot
        this.pivot.rotation.x = angle;
    
        // Cleanup after animation completes
        if (!this.animating) {
            // Reset cubies back to the main rubiksCube object
            while (this.pivot.children.length) {
                const cubie = this.pivot.children[0];
                this.rubiksCube.add(cubie);
            }
    
            // Remove the pivot from the scene
            this.scene.remove(this.pivot);
            this.pivot = null;
    
        }
    },    
    isValidMatrix(matrix) {
        // Check if the matrix contains valid numbers
        for (let i = 0; i < 16; i++) {
            if (isNaN(matrix.elements[i])) {
                return false;
            }
        }
        return true;
    },
    logMatrix(matrix) {
        console.log('Matrix:', matrix.elements);
    }
};


