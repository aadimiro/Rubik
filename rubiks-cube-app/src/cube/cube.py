import logging

class Cube:
    def __init__(self):
        logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG
        self.state = self.initialize_cube()
        self.orientation = {'x': 0, 'y': 0, 'z': 0}  # Orientation in degrees

    def initialize_cube(self):
        # Initialize the cube with the standard color configuration
        return {
            'U': ['W'] * 9,  # White (Upper face)
            'D': ['Y'] * 9,  # Yellow (Down face)
            'F': ['B'] * 9,  # Blue (Front face)
            'B': ['G'] * 9,  # Green (Back face)
            'L': ['O'] * 9,  # Orange (Left face)
            'R': ['R'] * 9   # Red (Right face)
        }

    def rotate_face(self, face, direction):
        """
        Rotates the specified face of the cube.
        Args:
            face: The key of the face to rotate in the `self.state` dictionary.
            direction: 'clockwise' or 'counterclockwise'.
        """
        rotation_pattern = {
            'clockwise': [6, 3, 0, 7, 4, 1, 8, 5, 2],
            'counterclockwise': [2, 5, 8, 1, 4, 7, 0, 3, 6]
        }
        rotated_indices = rotation_pattern[direction]
        self.state[face] = [self.state[face][i] for i in rotated_indices]

    def get_axis_and_direction(self, key):
        """
        Maps a key press to an axis and direction.
        Args:
            key: Key pressed (e.g., 'ArrowUp').
        Returns:
            Tuple (axis, direction) or None if the key is invalid.
        """
        mapping = {
            'ArrowUp': ('x', 'counterclockwise'),
            'ArrowDown': ('x', 'clockwise'),
            'ArrowLeft': ('y', 'counterclockwise'),
            'ArrowRight': ('y', 'clockwise'),
            'q': ('z', 'counterclockwise'),
            'e': ('z', 'clockwise')
        }
        return mapping.get(key)

    def rotate(self, axis, direction):
        """
        Rotate the cube around the specified axis.
        Args:
            axis: 'x', 'y', or 'z'.
            direction: 'clockwise' or 'counterclockwise'.
        """
        angle = 90 if direction == 'clockwise' else -90
        self.orientation[axis] = (self.orientation[axis] + angle) % 360

    def get_state(self):
        """
        Returns the current state of the cube.
        """
        return {'state': self.state, 'orientation': self.orientation}

    def set_state(self, state):
        """
        Updates the cube's state and orientation.
        """
        self.state = state['state']
        self.orientation = state['orientation']
