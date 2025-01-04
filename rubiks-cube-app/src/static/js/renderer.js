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
    animateMove(move) {
        if (this.animating) return;
        this.animating = true;
        this.animationProgress = 0;
        this.currentMove = move;
    },
    updateAnimation(delta) {
        if (!this.animating) return;
    
        const speed = Math.PI ; // Rotation speed in radians per second
        this.animationProgress += delta * speed;
    
        if (this.animationProgress >= Math.PI / 2) {
            this.animationProgress = Math.PI / 2;
            this.animating = false;
        }
    
        // Calculate the current rotation angle
        const angle = this.animationProgress;
    
        // Extract the main move component from the move string. This are R, L, U, D, F, B, M, E, S, x, y, z, Rw, Lw, Uw, Dw, Fw, Bw.
        // I.e. we need to remove any ' or 2 from the move string to get the main move component.
        const mainmovecomponent = this.currentMove.replace(/['2]/g, '');

        // Persistent pivot for the right face
        if (!this.pivot) {
            this.pivot = new THREE.Object3D();
            this.scene.add(this.pivot);
    
            // Find all cubies that belong to the right face and add them to the pivot
            const cubiesToRotate = this.getCubiesToRotate(mainmovecomponent);
            cubiesToRotate.forEach(cubie => {
                this.pivot.add(cubie);
            });
        }
    
        // Apply rotation to the pivot
        const axis = this.getRotationAxis(mainmovecomponent);

        // Moves which are default counterclockwise: R U F Rw Uw Fw S x y z
        // Moves which are default clockwise: L D B Lw Dw Bw M E
        const counterclockwiseMoves = ['R', 'U', 'F', 'Rw', 'Uw', 'Fw', 'S', 'x', 'y', 'z'];
        const direction = this.currentMove.includes("'") 
            ? (counterclockwiseMoves.includes(this.currentMove) ? 1 : -1) 
            : (counterclockwiseMoves.includes(this.currentMove) ? -1 : 1);
        const double = this.currentMove.includes("2");
        this.pivot.rotation[axis] = angle * direction * (double ? 2 : 1);
    
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
    getCubiesToRotate(move) {
        switch (move) {
            case 'R':
                return this.rubiksCube.children.filter(cubie => cubie.position.x > 0.9);
            case 'L':
                return this.rubiksCube.children.filter(cubie => cubie.position.x < -0.9);
            case 'U':
                return this.rubiksCube.children.filter(cubie => cubie.position.y > 0.9);
            case 'D':
                return this.rubiksCube.children.filter(cubie => cubie.position.y < -0.9);
            case 'F':
                return this.rubiksCube.children.filter(cubie => cubie.position.z > 0.9);
            case 'B':
                return this.rubiksCube.children.filter(cubie => cubie.position.z < -0.9);
            case 'M':
                return this.rubiksCube.children.filter(cubie => Math.abs(cubie.position.x) < 0.1);
            case 'E':
                return this.rubiksCube.children.filter(cubie => Math.abs(cubie.position.y) < 0.1);
            case 'S':
                return this.rubiksCube.children.filter(cubie => Math.abs(cubie.position.z) < 0.1);
            // case for x, y, z shall select all cubies
            case 'x':
            case 'y':
            case 'z':
                return [...this.rubiksCube.children];
            case 'Rw':
                return this.rubiksCube.children.filter(cubie => cubie.position.x > -0.3);
            case 'Lw':
                return this.rubiksCube.children.filter(cubie => cubie.position.x < +0.3);
            case 'Uw':
                return this.rubiksCube.children.filter(cubie => cubie.position.y > -0.3);
            case 'Dw':
                return this.rubiksCube.children.filter(cubie => cubie.position.y < 0.3);
            case 'Fw':
                return this.rubiksCube.children.filter(cubie => cubie.position.z > -0.3);
            case 'Bw':
                return this.rubiksCube.children.filter(cubie => cubie.position.z < 0.3);
            default:
                return [];
        }
    },
    getRotationAxis(move) {
        switch (move) {
            case 'R':
            case 'L':
            case 'Rw':
            case 'Lw':
            case 'M':
            case 'x':
                return 'x';            
            case 'x':
                return 'x';
            case 'U':
            case 'D':
            case 'E':
            case 'Uw':
            case 'Dw':
            case 'y':
                return 'y';
            case 'F':
            case 'B':
            case 'Fw':
            case 'Bw':
            case 'S':
            case 'z':
                return 'z';
            default:
                return 'x';
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


