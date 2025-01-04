export const EventHandler = {
    init(cube, animateMove) {
        let counterclockwisePressed = false;
        let widePressed = false;
        
        document.addEventListener('keydown', function(event) {
            const key = event.key;
        
            // Prevent key events from triggering when typing in the sequence input field
            if (document.activeElement.id === 'sequenceInput') {
                return;
            }
        
            if (key === "'" || key === "#") {
                counterclockwisePressed = true;
                return;
            }
        
            if (key === 'w') {
                widePressed = true;
                return;
            }

            if (key === 'z' && (event.ctrlKey || event.metaKey)) {
                cube.undo();
                return;
            }

            if (key === 'y' && (event.ctrlKey || event.metaKey)) {
                cube.redo();
                return;
            }

            if (key === ' ') {
                const moves = ["R", "L", "U", "D", "F", "B", "Rw", "Lw", "Uw", "Dw", "Fw", "Bw", "M", "E", "S", "x", "y", "z", "R2", "L2", "U2", "D2", "F2", "B2", "Rw2", "Lw2", "Uw2", "Dw2", "Fw2", "Bw2", "M2", "E2", "S2", "x2", "y2", "z2"];
                if (typeof EventHandler.moveIndex === 'undefined') {
                    EventHandler.moveIndex = 0; 
                }

                animateMove(moves[EventHandler.moveIndex]);
                EventHandler.moveIndex = (EventHandler.moveIndex + 1) % moves.length;
                return;
            }
        
            fetch('/cube/key-press', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key: key, counterclockwise: counterclockwisePressed, wide: widePressed }),
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
        
            if (event.key === 'w') {
                widePressed = false;
            }
        });
        
        // Add button click listeners
        this.setupButtons(cube,animateMove);
    },
    setupButtons(cube,animateMove) {
        // Reusable function to handle button click events
        function handleButtonClick(buttonId, endpoint, successMessage, getPayload = null) {
            document.getElementById(buttonId).addEventListener('click', function() {
                const payload = getPayload ? getPayload() : {};
                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        console.log(successMessage);
                        cube.fetchState(); // Fetch the updated state and re-render the cube
                    } else {
                        console.error('Error:', data.error);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            });
        }

        // Function to handle the sequence of moves
        function handleSequenceButtonClick(buttonId, endpoint, successMessage) {
            document.getElementById(buttonId).addEventListener('click', function() {
                const sequence = document.getElementById('sequenceInput').value.split(' ');
                sequence.forEach((move, index) => {
                    setTimeout(() => {
                        fetch(endpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ sequence: move }),
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (data.success) {
                                console.log(`Executed move: ${move}`);
                                animateMove(move); // Animate the move
                                //cube.fetchState(); // Fetch the updated state and re-render the cube
                            } else {
                                console.error('Error:', data.error);
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                    }, index * 5000); // Adjust the delay as needed
                });
            });
        }

        // Use the reusable function for the buttons
        handleButtonClick('mixButton', '/cube/shuffle', 'Shuffle executed');  
        handleButtonClick('RotateCornerLeft', '/cube/rotatecornerleft', 'Rotate Corner Left executed');
        handleButtonClick('RotateCornerRight', '/cube/rotatecornerright', 'Rotate Corner Right executed');
        handleButtonClick('InsertCornerLeft', '/cube/insertcornerleft', 'Insert Corner Left executed');
        handleButtonClick('InsertCornerRight', '/cube/insertcornerright', 'Insert Corner Right executed');
        handleButtonClick('AutoMoveLeft', '/cube/automoveleft', 'Auto Move Left executed');
        handleButtonClick('AutoMoveRight', '/cube/automoveright', 'Auto Move Right executed');
        handleButtonClick('LineToFish', '/cube/linetofish', 'Line to Fish executed');
        handleButtonClick('CornerToFish', '/cube/cornertofish', 'Corner to Fish executed');
        handleButtonClick('FishToYellow', '/cube/fishtoyellow', 'Fish to Yellow executed');
        handleButtonClick('SetSolved', '/cube/setsolved', 'Set Solved executed');
        handleButtonClick('Rotate3Edges', '/cube/rotate3edges', 'Rotate 3 Edges executed');
        handleButtonClick('Rotate3Corners', '/cube/rotate3corners', 'Rotate 3 Corners executed');

        // Use the new function for the "Execute Sequence" button
        handleSequenceButtonClick('executeButton', '/cube/execute-sequence', 'Executed sequence');

        handleButtonClick('RotateU', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "U" };
        });
        handleButtonClick('RotateUcc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "U'" };
        });
        handleButtonClick('RotateD', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "D" };
        });
        handleButtonClick('RotateDcc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "D'" };
        });
        handleButtonClick('RotateL', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "L" };
        });
        handleButtonClick('RotateLcc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "L'" };
        });
        handleButtonClick('RotateR', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "R" };
        });
        handleButtonClick('RotateRcc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "R'" };
        });
        handleButtonClick('RotateF', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "F" };
        });
        handleButtonClick('RotateFcc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "F'" };
        });
        handleButtonClick('RotateB', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "B" };
        });
        handleButtonClick('RotateBcc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "B'" };
        });
        handleButtonClick('RotateM', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "M" };
        });
        handleButtonClick('RotateMcc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "M'" };
        });
        handleButtonClick('RotateE', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "E" };
        });
        handleButtonClick('RotateEcc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "E'" };
        });
        handleButtonClick('RotateS', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "S" };
        });
        handleButtonClick('RotateScc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "S'" };
        });
        handleButtonClick('Rotatex', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "x" };
        });
        handleButtonClick('Rotatexcc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "x'" };
        });
        handleButtonClick('Rotatey', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "y" };
        });
        handleButtonClick('Rotateycc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "y'" };
        });
        handleButtonClick('Rotatez', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "z" };
        });
        handleButtonClick('Rotatezcc', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: "z'" };
        });

        // Add Undo and Redo button listeners
        document.getElementById('undoButton').addEventListener('click', function() {
            cube.undo();
        });

        document.getElementById('redoButton').addEventListener('click', function() {
            cube.redo();
        });
    }
};
