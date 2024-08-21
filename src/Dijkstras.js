const getNeighbors = (node, rows, cols) => {
  const [row, col] = node;
  const neighbors = [];
  if (row > 0) neighbors.push([row - 1, col]);
  if (row < rows - 1) neighbors.push([row + 1, col]);
  if (col > 0) neighbors.push([row, col - 1]);
  if (col < cols - 1) neighbors.push([row, col + 1]);
  return neighbors;
};

const Dijkstras = (grid, startNode, endNode, setGrid, onComplete) => {
  const rows = grid.length;
  const cols = grid[0].length;

  let openSet = [startNode];
  let cameFrom = {};
  let gScore = {};
  let metrics = {
    pathLength: 0,
    nodesVisited: 0,
    runtime: 0,
  };

  // Initialize scores
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      gScore[[row, col]] = Infinity;
    }
  }
  gScore[startNode] = 0;

  const startTime = Date.now();

  function step() {
    if (openSet.length === 0) {
      metrics.runtime = (Date.now() - startTime) / 1000;
      if (onComplete) onComplete(grid, metrics);
      return;
    }
    // Visualize the current node
    let currentNode = openSet.shift();
    if (currentNode.toString() === endNode.toString()) {
      const { newGrid, pathLength } = reconstructPath(
        cameFrom,
        startNode,
        endNode,
        grid
      );
      metrics.runtime = (Date.now() - startTime) / 1000; // runtime in seconds
      metrics.pathLength = pathLength;
      onComplete(newGrid, metrics); // Signal completion
      return;
    }

    const newGrid = grid.slice();
    newGrid[currentNode[0]][currentNode[1]].isVisited = true;
    metrics.nodesVisited++;
    setGrid(newGrid);

    // Spread to neighbors
    getNeighbors(currentNode, rows, cols).forEach((neighbor) => {
      const [nRow, nCol] = neighbor;

      // Skip neighbors that are walls
      if (grid[nRow][nCol].isWall) return;

      let tentativeGScore = gScore[currentNode] + 1;

      if (tentativeGScore < gScore[neighbor]) {
        cameFrom[neighbor] = currentNode;
        gScore[neighbor] = tentativeGScore;

        if (!openSet.some((n) => n.toString() === neighbor.toString())) {
          openSet.push(neighbor);
        }
      }
    });
    setTimeout(step, 20); // Animation delay
  }

  function reconstructPath(cameFrom, startNode, endNode, grid) {
    let currentNode = endNode;
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isPath: false,
      }))
    );
    let pathLength = 0;
    while (currentNode && currentNode.toString() !== startNode.toString()) {
      if (currentNode !== endNode) {
        newGrid[currentNode[0]][currentNode[1]].isPath = true;
        pathLength++;
      }
      currentNode = cameFrom[currentNode];
    }
    return { newGrid, pathLength };
  }

  step();
};

export default Dijkstras;
