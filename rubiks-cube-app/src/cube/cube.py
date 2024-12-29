import logging
import numpy as np

class Cube:
    def __init__(self):
        logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG
        self.state = self.initialize_cube()
        self.orientation_matrix = np.identity(3)  # 3x3 identity matrix

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
        self.orientation_matrix = np.dot(rotation_mat, self.orientation_matrix)

        logging.debug(f"Orientation matrix after:\n{self.orientation_matrix}")

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
