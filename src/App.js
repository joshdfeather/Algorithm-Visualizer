import React, { useState, useEffect } from "react";
import "./App.css";
import Dijkstras from "./Dijkstras";
import AStar from "./AStar";

function App() {
  const rows = 20;
  const cols = 20;
  const [startNode, setStartNode] = useState([6, 13]);
  const [endNode, setEndNode] = useState([10, 4]);
  const [draggingNodeType, setDraggingNodeType] = useState(null);
  const [wallNodes, setWallNodes] = useState(new Set());
  const [grid, setGrid] = useState(createInitialGrid(new Set())); // Pass initial wallNodes as a parameter
  const [algorithmToRun, setAlgorithmToRun] = useState(null);
  const [running, setRunning] = useState(false);
  const [metrics, setMetrics] = useState({
    pathLength: 0,
    nodesVisited: 0,
    runtime: 0,
  });

  // Create a new grid based on the start and end node positions and wall nodes
  function createInitialGrid(currentWallNodes) {
    const grid = [];
    for (let row = 0; row < rows; row++) {
      const currentRow = [];
      for (let col = 0; col < cols; col++) {
        currentRow.push({
          row,
          col,
          isStart: row === startNode[0] && col === startNode[1],
          isEnd: row === endNode[0] && col === endNode[1],
          isVisited: false,
          isPath: false,
          isWall: currentWallNodes.has(`${row}-${col}`),
        });
      }
      grid.push(currentRow);
    }
    return grid;
  }

  const resetBoard = () => {
    if (!running) {
      // Clear walls and reset the grid using a functional update
      setWallNodes(new Set()); // Clear walls
      setGrid(() => createInitialGrid(new Set())); // Use latest wallNodes to create grid
      setMetrics({ pathLength: 0, nodesVisited: 0, runtime: 0 });
    }
  };

  const startAlgorithm = (algorithm) => {
    if (!running) {
      setAlgorithmToRun(algorithm);
    }
  };

  // Run the selected algorithm
  useEffect(() => {
    if (algorithmToRun && !running) {
      setRunning(true);

      const newGrid = createInitialGrid(wallNodes); // Pass wallNodes to createGrid
      setGrid(newGrid);

      if (algorithmToRun === "dijkstra") {
        Dijkstras(
          newGrid,
          startNode,
          endNode,
          setGrid,
          (updatedGrid, newMetrics) => {
            setGrid(updatedGrid);
            setMetrics(newMetrics);
            setRunning(false);
            setAlgorithmToRun(null);
          }
        );
      } else if (algorithmToRun === "astar") {
        AStar(
          newGrid,
          startNode,
          endNode,
          setGrid,
          (updatedGrid, newMetrics) => {
            setGrid(updatedGrid);
            setMetrics(newMetrics);
            setRunning(false);
            setAlgorithmToRun(null);
          }
        );
      }

      setAlgorithmToRun(null);
    }
  }, [algorithmToRun, endNode, startNode, running, wallNodes]);

  const handleMouseDown = (nodeType, row, col) => {
    if (!running) {
      if (nodeType === "start") {
        setDraggingNodeType("start");
      } else if (nodeType === "end") {
        setDraggingNodeType("end");
      } else {
        setDraggingNodeType("wall");
        setWallNodes((prevWalls) => new Set(prevWalls.add(`${row}-${col}`)));
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((r) =>
            r.map((node) =>
              node.row === row && node.col === col
                ? { ...node, isWall: true }
                : node
            )
          );
          return newGrid;
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (grid[endNode[0]][endNode[1]].isWall) {
      setWallNodes((prevWalls) => {
        const newWalls = new Set(prevWalls);
        newWalls.delete(`${endNode[0]}-${endNode[1]}`);
        return newWalls;
      });
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((r) =>
          r.map((node) =>
            node.row === endNode[0] && node.col === endNode[1]
              ? { ...node, isWall: false }
              : node
          )
        );
        return newGrid;
      });
    } else if (grid[startNode[0]][startNode[1]].isWall) {
      setWallNodes((prevWalls) => {
        const newWalls = new Set(prevWalls);
        newWalls.delete(`${startNode[0]}-${startNode[1]}`);
        return newWalls;
      });
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((r) =>
          r.map((node) =>
            node.row === startNode[0] && node.col === startNode[1]
              ? { ...node, isWall: false }
              : node
          )
        );
        return newGrid;
      });
    }
    setDraggingNodeType(null);
  };

  const handleMouseEnter = (row, col) => {
    if (draggingNodeType === "start") {
      setStartNode([row, col]);
    } else if (draggingNodeType === "end") {
      setEndNode([row, col]);
    } else if (
      draggingNodeType === "wall" &&
      !grid[row][col].isStart &&
      !grid[row][col].isEnd
    ) {
      setWallNodes((prevWalls) => new Set(prevWalls.add(`${row}-${col}`)));
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((r) =>
          r.map((node) =>
            node.row === row && node.col === col
              ? { ...node, isWall: true }
              : node
          )
        );
        return newGrid;
      });
    }
  };

  useEffect(() => {
    if (!running) {
      setGrid(createInitialGrid(wallNodes)); // Pass wallNodes to createGrid
    }
  }, [startNode, endNode, wallNodes]);

  return (
    <div className="App">
      <div className="non-grid">
        <h1>Pathfinding Algorithm Visualizer</h1>
        <div className="buttons">
          <select
            onChange={(e) => startAlgorithm(e.target.value)}
            value={algorithmToRun || ""}
            disabled={running}
          >
            <option value="" disabled>
              Select Algorithm
            </option>
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="astar">A* Algorithm</option>
          </select>
          <button onClick={resetBoard} disabled={running}>
            Reset Board
          </button>
        </div>
        <div className="metrics">
          <h2>Metrics</h2>
          <div className="metrics-area">
            <p>
              Path Length: <span>{metrics.pathLength}</span>
            </p>
            <p>
              Nodes Visited: <span>{metrics.nodesVisited}</span>
            </p>
            <p>
              Runtime: <span>{metrics.runtime.toFixed(2)} seconds</span>
            </p>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="grid-container">
          <div className="grid" onMouseUp={handleMouseUp}>
            {grid.map((row, rowIdx) => (
              <div key={rowIdx} className="grid-row">
                {row.map((node, nodeIdx) => (
                  <div
                    key={nodeIdx}
                    className={`node 
                      ${node.isStart ? "start" : ""} 
                      ${node.isEnd ? "end" : ""} 
                      ${
                        !node.isStart && !node.isEnd && node.isVisited
                          ? "visited"
                          : ""
                      } 
                      ${node.isPath ? "path" : ""}
                      ${node.isWall ? "wall" : ""}`}
                    onMouseDown={() =>
                      node.isStart
                        ? handleMouseDown("start", node.row, node.col)
                        : node.isEnd
                        ? handleMouseDown("end", node.row, node.col)
                        : handleMouseDown("wall", node.row, node.col)
                    }
                    onMouseEnter={() => handleMouseEnter(node.row, node.col)}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
