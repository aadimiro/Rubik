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
        print(f"Received key: {key}")  # Debugging

        axis, direction = cube.get_axis_and_direction(key)
        print(f"Mapped to axis: {axis}, direction: {direction}")  # Debugging

        cube.rotate(axis, direction)
        return jsonify(success=True, state=cube.get_state())
    except ValueError as ve:
        print(f"ValueError: {ve}")
        return jsonify({"error": str(ve)}), 400  # Bad Request for invalid keys
    except Exception as e:
        print(f"Error processing key press: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
