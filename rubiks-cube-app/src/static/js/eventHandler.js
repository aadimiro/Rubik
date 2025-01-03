export const EventHandler = {
    init(cube) {
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
        this.setupButtons(cube);
    },
    setupButtons(cube) {
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
                .then(response => response.json())
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

        // Use the reusable function for the buttons
        handleButtonClick('mixButton', '/cube/shuffle', 'Shuffle executed');
        handleButtonClick('LineToFish', '/cube/linetofish', 'Line to Fish executed');
        handleButtonClick('CornerToFish', '/cube/cornertofish', 'Corner to Fish executed');
        handleButtonClick('FishToYellow', '/cube/fishtoyellow', 'Fish to Yellow executed');
        handleButtonClick('SetSolved', '/cube/setsolved', 'Set Solved executed');
        handleButtonClick('Rotate3Edges', '/cube/rotate3edges', 'Rotate 3 Edges executed');
        handleButtonClick('Rotate3Corners', '/cube/rotate3corners', 'Rotate 3 Corners executed');

        // Use the reusable function for the "Execute Sequence" button with a payload
        handleButtonClick('executeButton', '/cube/execute-sequence', 'Executed sequence', () => {
            return { sequence: document.getElementById('sequenceInput').value };
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
