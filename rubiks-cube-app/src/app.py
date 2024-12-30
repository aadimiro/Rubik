from flask import Flask, render_template, jsonify, request
from cube.cube import Cube

app = Flask(__name__)
cube = Cube()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cube/state', methods=['GET'])
def get_cube_state():
    return jsonify(cube.get_state())

@app.route('/cube/rotate', methods=['POST'])
def rotate_cube():
    data = request.get_json()
    axis = data['axis']
    direction = data['direction']
    cube.rotate(axis, direction)
    return jsonify(success=True, state=cube.get_state())

@app.route('/cube/key-press', methods=['POST'])
def handle_key_press():
    try:
        data = request.get_json()
        key = data.get('key')
        shift_pressed = data.get('shift', False)
        print(f"Received key: {key}, shift: {shift_pressed}")  # Debugging

        if key == 'Shift':
            return jsonify(success=True, state=cube.get_state())

        if key in ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'q', 'e']:
            axis, direction = cube.get_axis_and_direction(key)
            print(f"Mapped to axis: {axis}, direction: {direction}")  # Debugging
            cube.rotate(axis, direction)
        elif key.lower() in ['u', 'r', 'l', 'f', 'b', 'd']:  # Normalize key to lowercase
            face, direction = cube.get_face_and_direction(key, shift_pressed)
            print(f"Mapped to face: {face}, direction: {direction}")  # Debugging
            cube.rotate_face_oriented(face, direction)
        else:
            raise ValueError("Invalid key")

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
        shuffle_sequence = cube.shuffle()
        return jsonify(success=True, sequence=shuffle_sequence, state=cube.get_state())
    except Exception as e:
        print(f"Error shuffling cube: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
