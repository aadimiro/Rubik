# Rubik's Cube Web Application

This project is a web application that allows users to interact with a 3D representation of a Rubik's Cube. Users can mix and manipulate the cube, with plans to implement solving functionality in future updates.

## Project Structure

```
rubiks-cube-app
├── src
│   ├── app.py                # Main entry point of the web application
│   ├── cube
│   │   ├── __init__.py       # Marks the cube directory as a package
│   │   ├── cube.py           # Contains the Cube class for cube manipulation
│   │   └── solver.py         # Contains the Solver class for solving algorithms
│   ├── static
│   │   ├── css
│   │   │   └── styles.css     # CSS styles for the application
│   │   ├── js
│   │   │   └── cube.js        # JavaScript for rendering the 3D cube
│   └── templates
│       └── index.html        # Main HTML template for the application
├── requirements.txt           # Python dependencies for the project
├── README.md                  # Documentation for the project
└── .gitignore                 # Files and directories to ignore by Git
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd rubiks-cube-app
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```
   python src/app.py
   ```

5. **Access the application:**
   Open your web browser and navigate to `http://localhost:5000`.

## Future Enhancements

- Implement solving algorithms in the `solver.py` file.
- Add user authentication and save cube states.
- Enhance the 3D rendering with more interactive features.

## License

This project is licensed under the MIT License - see the LICENSE file for details.