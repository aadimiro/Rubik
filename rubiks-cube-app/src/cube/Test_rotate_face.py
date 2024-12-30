from cube import Cube

def print_face(face):
    for i in range(0, 9, 3):
        print(face[i:i+3])

def print_cube_state(cube):
    print("Up (U) face:")
    print_face(cube.state['U'])
    print("Down (D) face:")
    print_face(cube.state['D'])
    print("Front (F) face:")
    print_face(cube.state['F'])
    print("Back (B) face:")
    print_face(cube.state['B'])
    print("Left (L) face:")
    print_face(cube.state['L'])
    print("Right (R) face:")
    print_face(cube.state['R'])

def test_rotate_face():
    cube = Cube()
    
    print("Initial state:")
    print_cube_state(cube)
    
    # Rotate the 'U' face clockwise
    cube.rotate_face('U', 'clockwise')
    print("\nAfter rotating 'U' face clockwise:")
    print_cube_state(cube)
    
    # Rotate the 'U' face counterclockwise
    cube.rotate_face('U', 'counterclockwise')
    print("\nAfter rotating 'U' face counterclockwise:")
    print_cube_state(cube)
    
    # Rotate the 'D' face clockwise
    cube.rotate_face('D', 'clockwise')
    print("\nAfter rotating 'D' face clockwise:")
    print_cube_state(cube)
    
    # Rotate the 'D' face counterclockwise
    cube.rotate_face('D', 'counterclockwise')
    print("\nAfter rotating 'D' face counterclockwise:")
    print_cube_state(cube)
    
    # Rotate the 'F' face clockwise
    cube.rotate_face('F', 'clockwise')
    print("\nAfter rotating 'F' face clockwise:")
    print_cube_state(cube)
    
    # Rotate the 'F' face counterclockwise
    cube.rotate_face('F', 'counterclockwise')
    print("\nAfter rotating 'F' face counterclockwise:")
    print_cube_state(cube)
    
    # Rotate the 'B' face clockwise
    cube.rotate_face('B', 'clockwise')
    print("\nAfter rotating 'B' face clockwise:")
    print_cube_state(cube)
    
    # Rotate the 'B' face counterclockwise
    cube.rotate_face('B', 'counterclockwise')
    print("\nAfter rotating 'B' face counterclockwise:")
    print_cube_state(cube)
    
    # Rotate the 'L' face clockwise
    cube.rotate_face('L', 'clockwise')
    print("\nAfter rotating 'L' face clockwise:")
    print_cube_state(cube)
    
    # Rotate the 'L' face counterclockwise
    cube.rotate_face('L', 'counterclockwise')
    print("\nAfter rotating 'L' face counterclockwise:")
    print_cube_state(cube)
    
    # Rotate the 'R' face clockwise
    cube.rotate_face('R', 'clockwise')
    print("\nAfter rotating 'R' face clockwise:")
    print_cube_state(cube)
    
    # Rotate the 'R' face counterclockwise
    cube.rotate_face('R', 'counterclockwise')
    print("\nAfter rotating 'R' face counterclockwise:")
    print_cube_state(cube)

if __name__ == "__main__":
    test_rotate_face()