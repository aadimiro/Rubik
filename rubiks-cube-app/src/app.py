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
    return jsonify(success=True)

@app.route('/cube/mix', methods=['POST'])
def mix_cube():
    data = request.get_json()
    if not data or 'moves' not in data:
        return jsonify({"error": "Invalid request"}), 400
    moves = data['moves']
    cube.mix(moves)
    return jsonify(success=True)

if __name__ == '__main__':
    app.run(debug=True)