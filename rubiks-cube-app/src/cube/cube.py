import logging
import numpy as np

class Cube:
    def __init__(self):
        logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG
        self.state = self.initialize_cube()
        self.orientation_matrix = np.identity(3)  # 3x3 identity matrix

    def initialize_cube(self):
        # Initialize the cube with the standard color configuration
        cube_state = {
            'U': ['W'] * 9,  # White (Upper face)
            'D': ['Y'] * 9,  # Yellow (Down face)
            'F': ['R'] * 9,  # Red (Front face)
            'B': ['O'] * 9,  # Orange (Back face)
            'L': ['G'] * 9,  # Green (Left face)
            'R': ['B'] * 9   # Blue (Right face)
        }

        self.state = cube_state

        # Perform a right face rotation clockwise
        #self.rotate_face('U', 'clockwise')
        #self.rotate_face('R', 'clockwise')

         #set all faces to R G B O W Y B R O
        #for face in ['U', 'D', 'F', 'B', 'L', 'R']:
        #    self.state[face] = ['R', 'G', 'B', 'O', 'W', 'Y', 'B', 'R', 'O']

        

        # Print all faces as text
        print("Initial state:")
        for face in ['U', 'D', 'F', 'B', 'L', 'R']:
            print(f"{face} face:")
            for i in range(0, 9, 3):
                print(cube_state[face][i:i+3])



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
            A tuple (axis, direction) where axis is 'x', 'y', or 'z' and direction is 1 or -1.
        """
        if key == 'ArrowUp':
            return 'x', 'clockwise'
        elif key == 'ArrowDown':
            return 'x', 'counterclockwise'
        elif key == 'ArrowLeft':
            return 'y', 'clockwise'
        elif key == 'ArrowRight':
            return 'y', 'counterclockwise'
        elif key == 'q':
            return 'z', 'counterclockwise'
        elif key == 'e':
            return 'z', 'clockwise'
        else:
            raise ValueError("Invalid key")

    def get_face_and_direction(self, key, shift_pressed):
        """
        Map key press to face and direction.
        Args:
            key: The key pressed.
            shift_pressed: Whether the Shift key is pressed.
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
        direction = 'counterclockwise' if shift_pressed else 'clockwise'
        face = face_map.get(key.lower())  # Normalize key to lowercase
        if face is None:
            raise ValueError("Invalid key")
        return face, direction

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
        #self.orientation_matrix = np.dot(rotation_mat, self.orientation_matrix)
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
