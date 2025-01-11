import sys
import os
from flask import Flask, render_template, jsonify, request, session

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from cube.cube import Cube

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # Ensure you have a secret key for secure cookies

def get_user_cube():
    if 'cube' not in session:
        session['cube'] = Cube().get_state()
    cube = Cube()
    cube.set_state(session['cube'])
    return cube

def save_user_cube(cube):
    session['cube'] = cube.get_state()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cube/state', methods=['GET'])
def get_cube_state():
    cube = get_user_cube()
    return jsonify(cube.get_state())

@app.route('/cube/set-state', methods=['POST'])
def set_cube_state():
    data = request.get_json()
    state = {
        'state': data['state'],
        'orientation': data['orientation']
    }
    cube = get_user_cube()
    cube.set_state(state)
    save_user_cube(cube)
    return jsonify(success=True)

@app.route('/cube/key-press', methods=['POST'])
def handle_key_press():
    try:
        data = request.get_json()
        key = data.get('key')
        counterclockwise_pressed = data.get('counterclockwise', False)
        wide_pressed = data.get('wide', False)
        print(f"Received key: {key}, counterclockwise: {counterclockwise_pressed}, wide: {wide_pressed}")  # Debugging

        cube = get_user_cube()

        if key in ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '8', '2', '4', '6', '3', '7', '9', '1']:
            axis, direction = cube.get_axis_and_direction(key)
            print(f"Mapped to axis: {axis}, direction: {direction}")  # Debugging
            cube.rotate(axis, direction)
        elif key.lower() in ['u', 'r', 'l', 'f', 'b', 'd']:  # Normalize key to lowercase
            face, direction = cube.get_face_and_direction(key, counterclockwise_pressed)
            print(f"Mapped to face: {face}, direction: {direction}")  # Debugging
            if wide_pressed:
                cube.rotate_wide_oriented(face, direction)
            else:
                cube.rotate_face_oriented(face, direction)
        elif key.lower() in ['m', 'e', 's']:  # Normalize key to lowercase
            slice, direction = cube.get_slice_and_direction(key, counterclockwise_pressed)
            print(f"Mapped to slice: {slice}, direction: {direction}")  # Debugging
            cube.rotate_slice_oriented(slice, direction)
        else:
            raise ValueError("Invalid key")

        save_user_cube(cube)
        return jsonify(success=True, state=cube.get_state())
    except ValueError as ve:
        print(f"ValueError: {ve}")
        return jsonify({"error": str(ve)}), 400  # Bad Request for invalid keys
    except Exception as e:
        print(f"Error processing key press: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/cube/shuffle', methods=['POST'])
def shuffle_cube():
    try:
        cube = get_user_cube()
        shuffle_sequence = cube.shuffle()
        save_user_cube(cube)
        return jsonify(success=True, sequence=shuffle_sequence, state=cube.get_state())
    except Exception as e:
        print(f"Error shuffling cube: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/cube/rotate', methods=['POST'])
def rotate_cube():
    data = request.get_json()
    axis = data['axis']
    direction = data['direction']
    cube = get_user_cube()
    cube.rotate(axis, direction)
    save_user_cube(cube)
    return jsonify(success=True, state=cube.get_state())

@app.route('/cube/setsolved', methods=['POST'])
def setsolved():
    try:
        cube = get_user_cube()
        cube.initialize_cube()     # Call the method you want to execute
        save_user_cube(cube)
        return jsonify(success=True, state=cube.get_state())
    except Exception as e:
        print(f"Error executing Set Solved: {e}")
        return jsonify({"error": str(e)}), 500

def execute_move_sequence(sequence):
    try:
        print(f"Executing sequence: {sequence}")  # Debugging
        cube = get_user_cube()
        cube.move_sequence(sequence)
        save_user_cube(cube)
        return jsonify(success=True, state=cube.get_state())
    except ValueError as ve:
        print(f"ValueError: {ve}")
        return jsonify({"error": str(ve)}), 400  # Bad Request for invalid sequences
    except Exception as e:
        print(f"Error executing move sequence: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/cube/execute-sequence', methods=['POST'])
def execute_sequence():
    return execute_move_sequence(request.get_json().get('sequence'))

@app.route('/cube/rotatecornerleft', methods=['POST'])
def rotatecornerleft():
    return execute_move_sequence("L' U2 L U")

@app.route('/cube/rotatecornerright', methods=['POST'])
def rotatecornerright():
    return execute_move_sequence("R U2 R' U'")

@app.route('/cube/insertcornerleft', methods=['POST'])
def insertcornerleft():
    return execute_move_sequence("L' U' L")

@app.route('/cube/insertcornerright', methods=['POST'])
def insertcornerright():
    return execute_move_sequence("R U R'")

@app.route('/cube/automoveleft', methods=['POST'])
def automoveleft():
    return execute_move_sequence("U' L' U L U F U' F'")

@app.route('/cube/automoveright', methods=['POST'])
def automoveright():
    return execute_move_sequence("U R U' R' U' F' U F")

@app.route('/cube/linetofish', methods=['POST'])
def linetofish():
    return execute_move_sequence("F R U R' U' F'")

@app.route('/cube/cornertofish', methods=['POST'])
def cornertofish():
    return execute_move_sequence("Fw R U R' U' Fw'")

@app.route('/cube/fishtoyellow', methods=['POST'])
def fishtoyellow():
    return execute_move_sequence("R U R' U R U2 R'")

@app.route('/cube/rotate3edges', methods=['POST'])
def rotate3edges():
    return execute_move_sequence("R' U R' U' R' U' R' U R U R2")

@app.route('/cube/rotate3corners', methods=['POST'])
def rotate3corners():
    return execute_move_sequence("R U' R D2 R' U R D2 R2")

if __name__ == '__main__':
    app.run(debug=True)
