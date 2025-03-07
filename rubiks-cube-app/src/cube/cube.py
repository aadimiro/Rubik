import logging
import numpy as np

class Cube:
    def __init__(self):
        logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG
        self.orientation_matrix = np.identity(3)  # 3x3 identity matrix
        self.state = self.initialize_cube()

    def initialize_cube(self):
        # Initialize the cube with the standard color configuration
        cube_state = {
            'U': ['W'] * 9,  # White (Upper face)
            'D': ['Y'] * 9,  # Yellow (Down face)
            'F': ['G'] * 9,  # Red (Front face)
            'B': ['B'] * 9,  # Orange (Back face)
            'L': ['O'] * 9,  # Green (Left face)
            'R': ['R'] * 9   # Blue (Right face)
        }
        self.state = cube_state
        return self.state
    

    def rotation_matrix(self, axis, angle):
        """
        Generate a rotation matrix for a given axis and angle.
        Args:
            axis: 'x', 'y', or 'z'.
            angle: Angle in degrees.
        Returns:
            A 3x3 numpy array representing the rotation matrix.
        """
        angle_rad = np.deg2rad(angle)
        if axis == 'x':
            return np.array([
                [1, 0, 0],
                [0, np.cos(angle_rad), -np.sin(angle_rad)],
                [0, np.sin(angle_rad), np.cos(angle_rad)]
            ])
        elif axis == 'y':
            return np.array([
                [np.cos(angle_rad), 0, np.sin(angle_rad)],
                [0, 1, 0],
                [-np.sin(angle_rad), 0, np.cos(angle_rad)]
            ])
        elif axis == 'z':
            return np.array([
                [np.cos(angle_rad), -np.sin(angle_rad), 0],
                [np.sin(angle_rad), np.cos(angle_rad), 0],
                [0, 0, 1]
            ])
        else:
            raise ValueError("Invalid axis")

    def get_axis_and_direction(self, key):
        """
        Determine the axis and direction of rotation based on the key press.
        Args:
            key: The key pressed (e.g., 'ArrowUp', 'ArrowDown', etc.).
        Returns:
            A tuple (axis, direction) where axis is 'x', 'y', or 'z' and direction is 'clockwise' or 'counterclockwise'.
        """
        key_map = {
            'ArrowUp': ('x', 'counterclockwise'),
            '8': ('x', 'counterclockwise'),
            '9': ('x', 'counterclockwise'),
            'ArrowDown': ('x', 'clockwise'),
            '2': ('x', 'clockwise'),
            '1': ('x', 'clockwise'),
            'ArrowLeft': ('y', 'counterclockwise'),
            '4': ('y', 'counterclockwise'),
            'ArrowRight': ('y', 'clockwise'),
            '6': ('y', 'clockwise'),
            '3': ('z', 'counterclockwise'),
            '7': ('z', 'clockwise')
        }

        if key in key_map:
            return key_map[key]
        else:
            raise ValueError("Invalid key")

    def get_face_and_direction(self, key, counterclockwise_pressed):
        """
        Map key press to face and direction.
        Args:
            key: The key pressed.
            counterclockwise_pressed: Whether the counterclockwise key is pressed.
        Returns:
            A tuple of (face, direction).
        """
        face_map = {
            'u': 'U',
            'r': 'R',
            'l': 'L',
            'f': 'F',
            'b': 'B',
            'd': 'D'
        }
        direction = 'counterclockwise' if counterclockwise_pressed else 'clockwise'
        face = face_map.get(key.lower())
        if face is None:
            raise ValueError("Invalid key")
        return face, direction

    def get_slice_and_direction(self, key, counterclockwise_pressed):
        """
        Map key press to slice and direction.
        Args:
            key: The key pressed.
            counterclockwise_pressed: Whether the counterclockwise key is pressed.
        Returns:
            A tuple of (slice, direction).
        """
        slice_map = {
            'm': 'M',
            'e': 'E',
            's': 'S'
        }
        direction = 'counterclockwise' if counterclockwise_pressed else 'clockwise'
        slice = slice_map.get(key.lower())
        if slice is None:
            raise ValueError("Invalid key")
        return slice, direction

    def rotate(self, axis, direction):
        """
        Rotate the cube around the specified axis considering the cube current orientation.
        Args:
            axis: 'x', 'y', or 'z'.
            direction: 'clockwise' or 'counterclockwise'.
        """
        angle = 90 if direction == 'clockwise' else -90
        rotation_mat = self.rotation_matrix(axis, angle)

        logging.debug(f"Orientation matrix before:\n{self.orientation_matrix}")
        logging.debug(f"Rotation matrix for axis {axis} and angle {angle}:\n{rotation_mat}")

        # Update the orientation matrix
        self.orientation_matrix = np.dot(self.orientation_matrix,rotation_mat)

        logging.debug(f"Orientation matrix after:\n{self.orientation_matrix}")

    def rotate_face(self, face, direction):
        """
        Rotate a face of the cube and update adjacent edges.
        Args:
            face: 'U', 'D', 'F', 'B', 'L', or 'R'.
            direction: 'clockwise' or 'counterclockwise'.
        """
        # Helper function to rotate a 3x3 grid
        def rotate_grid(grid, clockwise):
            if clockwise:
                return [
                    grid[6], grid[3], grid[0],
                    grid[7], grid[4], grid[1],
                    grid[8], grid[5], grid[2]
                ]
            else:
                return [
                    grid[2], grid[5], grid[8],
                    grid[1], grid[4], grid[7],
                    grid[0], grid[3], grid[6]
                ]

        # Rotate the face itself
        if face in ['L', 'R', 'B']:
            self.state[face] = rotate_grid(self.state[face], direction != 'clockwise')
        else:
            self.state[face] = rotate_grid(self.state[face], direction == 'clockwise')

        # Adjacent edges affected by the face rotation
        adjacent = {
            'U': [('F', 2), ('R', 2), ('B', 2), ('L', 2)],
            'D': [('F', 0), ('L', 0), ('B', 0), ('R', 0)],
            'F': [('U', 2), ('R', 3), ('D', 0), ('L', 1)],
            'B': [('U', 0), ('L', 3), ('D', 2), ('R', 1)],
            'L': [('U', 3), ('F', 1), ('D', 3), ('B', 1)],
            'R': [('U', 1), ('B', 3), ('D', 1), ('F', 3)],
        }

        # Extract the relevant rows/columns from adjacent faces
        def get_row(face, row):
            if row == 0:  # Top row
                return self.state[face][:3]
            elif row == 1:  # Right column
                return [self.state[face][2], self.state[face][5], self.state[face][8]]
            elif row == 2:  # Bottom row
                return self.state[face][6:]
            elif row == 3:  # Left column
                return [self.state[face][0], self.state[face][3], self.state[face][6]]

        def set_row(face, row, new_values):
            if row == 0:
                self.state[face][:3] = new_values
            elif row == 1:
                self.state[face][2], self.state[face][5], self.state[face][8] = new_values
            elif row == 2:
                self.state[face][6:] = new_values
            elif row == 3:
                self.state[face][0], self.state[face][3], self.state[face][6] = new_values

        # Get the affected rows
        rows = [get_row(f, r) for f, r in adjacent[face]]

        # Rotate adjacent edges
        if face in ['U', 'D']:
            if direction == 'counterclockwise':
                rows = [rows[3][::-1], rows[0][::-1], rows[1], rows[2]]
            else:
                rows = [rows[1][::-1], rows[2], rows[3], rows[0][::-1]]
        elif face in ['R']:
            if direction == 'counterclockwise':
                rows = [rows[1], rows[2], rows[3][::-1], rows[0][::-1]]
            else:
                rows = [rows[3][::-1], rows[0], rows[1], rows[2][::-1]]
        elif face in ['L']:
            if direction == 'counterclockwise':
                rows = [rows[1][::-1], rows[2][::-1], rows[3], rows[0]]
            else:
                rows = [rows[3], rows[0][::-1], rows[1][::-1], rows[2]]
        elif face in ['F']:
            if direction == 'counterclockwise':
                rows = [rows[1][::-1], rows[2], rows[3][::-1], rows[0]]
            else:
                rows = [rows[3], rows[0][::-1], rows[1], rows[2][::-1]]
        elif face in ['B']:
            if direction == 'counterclockwise':
                rows = [rows[1], rows[2][::-1], rows[3], rows[0][::-1]]
            else:
                rows = [rows[3][::-1], rows[0], rows[1][::-1], rows[2]]

        # Set the affected rows back
        for (f, r), new_row in zip(adjacent[face], rows):
            set_row(f, r, new_row)

    def rotate_face_oriented(self, face, direction):
        # The input values face and direction are from the user's perspective.
        # Before calling rotate_face, determine the effective face and direction with which rotate_face shall
        # be called, based on the current orientation.
        # The orientation matrix is a 3x3 matrix that represents the orientation of the cube.
        # Determine the effective face and direction based on the current orientation
        face_to_axis = {
            'U': np.array([0, 1, 0]),
            'D': np.array([0, -1, 0]),
            'F': np.array([0, 0, 1]),
            'B': np.array([0, 0, -1]),
            'L': np.array([-1, 0, 0]),
            'R': np.array([1, 0, 0])
        }

        # Transform the face vector by the orientation matrix
        face_vector = face_to_axis[face]
        transformed_vector = np.dot(self.orientation_matrix, face_vector)

        # Determine the effective face after transformation
        effective_face = None
        max_dot = -1
        for f, vec in face_to_axis.items():
            dot_product = np.dot(transformed_vector, vec)
            if dot_product > max_dot:
                max_dot = dot_product
                effective_face = f

        # Rotate the effective face
        self.rotate_face(effective_face, direction)

    def rotate_slice_oriented(self, slice, direction):
        # This function performs M, E, and S moves by combining the rotation of two faces and a cube rotation,
        # making use of the rotate_face_oriented and rotate functions.
        
        # Define the mapping of slice for clockwise
        # M (clockwise) = L' + R + x'
        # E (clockwise) = D' + U + y'
        # S (clockwise) = F' + B + z'
        slice_map = {
            'M': [('L', 'counterclockwise'), ('R', 'clockwise'), ('x', 'counterclockwise')],
            'E': [('D', 'counterclockwise'), ('U', 'clockwise'), ('y', 'counterclockwise')],
            'S': [('F', 'counterclockwise'), ('B', 'clockwise'), ('z', 'clockwise')]
        }

        # Reverse the previous operations if direction is counterclockwise
        if direction == 'counterclockwise':
            slice_map = {k: [(face, 'counterclockwise' if dir == 'clockwise' else 'clockwise') for face, dir in v] for k, v in slice_map.items()}

        # Perform operation in slice_map
        for face, dir in slice_map[slice][:2]:
            self.rotate_face_oriented(face, dir)
        axis, dir = slice_map[slice][2]
        self.rotate(axis, dir)
            
    def rotate_wide_oriented(self, wide, direction):
        # This function performs Rw, Lw, Fw, Bw, Uw, and Dw moves by combining the rotation of two faces and a cube rotation,
        # making use of the rotate_face_oriented and rotate_slice_oriented functions.
        
        # Define the mapping of wide for clockwise
        # Rw (clockwise) = R + M' + x'
        # Lw (clockwise) = L + M + x
        # Fw (clockwise) = F + S' + z
        # Bw (clockwise) = B + S + z'
        # Uw (clockwise) = U + E + y
        # Dw (clockwise) = D + E' + y'
        wide_map = {
            'R': [('R', 'clockwise'), ('M', 'counterclockwise')],
            'L': [('L', 'clockwise'), ('M', 'clockwise')],
            'F': [('F', 'clockwise'), ('S', 'clockwise')],
            'B': [('B', 'clockwise'), ('S', 'counterclockwise')],
            'U': [('U', 'clockwise'), ('E', 'counterclockwise')],
            'D': [('D', 'clockwise'), ('E', 'clockwise')]
        }

        # Reverse the previous operations if direction is counterclockwise
        if direction == 'counterclockwise':
            wide_map = {k: [(face, 'counterclockwise' if dir == 'clockwise' else 'clockwise') for face, dir in v] for k, v in wide_map.items()}

        face, dir = wide_map[wide][0]
        self.rotate_face_oriented(face, dir)
        slice, dir = wide_map[wide][1]
        self.rotate_slice_oriented(slice, dir)
        
    def move_sequence(self, sequence):
        # This function performs a sequence of moves.
        # The sequence is a string of moves separated by spaces.
        # Following are the possible moves: U, U', U2, D, D', D2, F, F', F2, B, B', B2, L, L', L2, R, R', R2,
        # M, M', M2, E, E', E2, S, S', S2, x, x', x2, y, y', y2, z, z', z2.
        # Rw, Rw', Rw2, Lw, Lw', Lw2, Fw, Fw', Fw2, Bw, Bw', Bw2, Uw, Uw', Uw2, Dw, Dw', Dw2.
        # The moves are performed by calling the appropriate functions.

        # Split the sequence by spaces
        moves = sequence.split()
        for move in moves:
            # Extract direction and double move flags from the move
            # direction = 'clockwise' if "'" not in move else 'counterclockwise' 
            # double = True if '2' in move else False
            direction = 'clockwise'
            double = False
            if "'" in move:
                direction = 'counterclockwise'
            if '2' in move:
                double = True
            # Extract the move type
            move = move.replace("'", "").replace("2", "")
            if move in ['U', 'D', 'F', 'B', 'L', 'R']:
                self.rotate_face_oriented(move, direction)
                if double:
                    self.rotate_face_oriented(move, direction)
            elif move in ['M', 'E', 'S']:
                self.rotate_slice_oriented(move, direction)
                if double:
                    self.rotate_slice_oriented(move, direction)
            elif move in ['x', 'y', 'z']:
                self.rotate(move, direction)
                if double:
                    self.rotate(move, direction)
            elif move in ['Rw', 'Lw', 'Fw', 'Bw', 'Uw', 'Dw']:
                self.rotate_wide_oriented(move[0], direction)
                if double:
                    self.rotate_wide_oriented(move[0], direction)
            else:
                raise ValueError("Invalid move")
           
           

    def shuffle(self, num_moves=20):
        """
        Shuffle the cube by performing a sequence of random moves.
        Args:
            num_moves: Number of random moves to perform.
        """
        import random
        # For num_moves, generate a random face and direction and rotate the face
        for _ in range(num_moves):
            face = random.choice(['U', 'D', 'F', 'B', 'L', 'R'])
            direction = random.choice(['clockwise', 'counterclockwise'])
            self.rotate_face(face, direction)
            

    def get_state(self):
        """
        Returns the current state of the cube.
        """
        return {'state': self.state, 'orientation': self.orientation_matrix.tolist()}

    def set_state(self, state):
        """
        Updates the cube's state and orientation.
        """
        self.state = state['state']
        self.orientation_matrix = np.array(state['orientation'])
