# canvas3d

A web application:

1. An input process in which a canvas with two dimensional inputs of closed polygonal shapes (representing composite plies in a lay-up)

2. These polygonal shapes has vertices (X,Y) which can span meters. 

3. each of the polygonal shapes are overlapping ply-stacks.

4. there is a scroll bar in the Y-Axis which can be used to rotate the shapes into 3D.

## Implementation Plan

### Objective
Develop a web application that visualizes overlapping composite plies (polygons) in 2D and allows the user to rotate the view into 3D using a Y-axis scroll bar. The shapes span meters.

### Key Files & Context
- `index.html`: Entry point for the web application.
- `package.json`: Project dependencies and scripts.
- `src/App.tsx`: Main React component.
- `src/Canvas3D.tsx`: Three.js scene containing the plies.
- `src/Ply.tsx`: Component representing a single polygonal ply.

### Implementation Steps
1. **Initialize Project**: Create a new React application with Vite, using TypeScript.
2. **Install Dependencies**: Install `three`, `@react-three/fiber`, and `@react-three/drei`.
3. **Set up the App Structure**: Define a state for the rotation angle (controlled by a slider/scroll).
4. **Create the 3D Scene**: Use a single `@react-three/fiber` canvas. Setup lighting and an orthographic or perspective camera initially looking straight down the Z-axis (top-down view).
5. **Render Polygons (Plies)**: 
   - Accept input data (X,Y vertices for multiple overlapping shapes).
   - Use `three`'s `ShapeGeometry` or `ExtrudeGeometry` to render the plies.
   - Stack plies with a small offset along the Z-axis to handle overlapping.
6. **Implement 3D Rotation Interaction**:
   - Add a vertical input slider (`<input type="range" />`).
   - Tie the slider value to the camera's angle or the scene's rotation, pivoting around the X-axis (tilting the Y-axis) to reveal the 3D layered structure.
7. **Scale Handling**: Ensure the camera position and frustum can accommodate polygons spanning meters.
