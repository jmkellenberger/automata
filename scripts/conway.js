// Relative coordinates for creating common Conway patterns
const SHAPES = {
  Cell: [[0, 0]],
  Glider: [
    [0, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  "Gosper Glider Gun": [
    [1, 5],
    [1, 6],
    [2, 5],
    [2, 6],
    [11, 5],
    [11, 6],
    [11, 7],
    [12, 4],
    [12, 8],
    [13, 3],
    [13, 9],
    [14, 3],
    [14, 9],
    [15, 6],
    [16, 4],
    [16, 8],
    [17, 5],
    [17, 6],
    [17, 7],
    [18, 6],
    [21, 3],
    [21, 4],
    [21, 5],
    [22, 3],
    [22, 4],
    [22, 5],
    [23, 2],
    [23, 6],
    [25, 1],
    [25, 2],
    [25, 6],
    [25, 7],
    [35, 3],
    [35, 4],
    [36, 3],
    [36, 4],
  ],
};

class Cell {
  static aliveColor = "#6557DA";
  static deadColor = "#111";
  static width = 10;
  static height = 10;
  static aliveProbability = 0.5;

  constructor(context, gridX, gridY) {
    this.context = context;

    this.gridX = gridX;
    this.gridY = gridY;

    this.alive = Math.random() > Cell.aliveProbability;
  }

  draw() {
    this.context.fillStyle = this.alive ? Cell.aliveColor : Cell.deadColor;
    this.context.strokeWidth = 0;
    this.context.fillRect(
      this.gridX * Cell.width,
      this.gridY * Cell.height,
      Cell.width,
      Cell.height
    );
  }
}

class Simulation {
  static numColumns = 100;
  static numRows = 100;
  static displayStats = true;
  static refreshTime = 100;
  static font = "16px Optima";
  static textSpacing = 20;
  static shapes = SHAPES;

  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.cells = [];
    this.generation = 0;
    this.alive = 0;
    this.dead = 0;

    this.running = false;

    this.createGrid();
    this.countCurrentCells;
    this.totalBorn = this.cellsAlive();
    this.totalDead = this.cellsDead();

    window.requestAnimationFrame(() => this.draw());
  }

  createGrid() {
    for (let y = 0; y < Simulation.numRows; y++) {
      for (let x = 0; x < Simulation.numColumns; x++) {
        this.cells.push(new Cell(this.context, x, y));
      }
    }
  }

  toggleCell(idx) {
    let cell = this.cells[idx];

    if (cell.alive) {
      cell.alive = false;
      this.totalDead += 1;
    } else {
      cell.alive = true;
      this.totalBorn += 1;
    }
  }

  rotateCoords(x, y, angle) {
    // Convert the angle from degrees to radians
    let radians = (angle * Math.PI) / 180;

    // Create the rotation matrix
    let rotationMatrix = [
      [Math.cos(radians), -Math.sin(radians)],
      [Math.sin(radians), Math.cos(radians)],
    ];

    // Rotate the coordinates using the rotation matrix
    let rotatedX = rotationMatrix[0][0] * x + rotationMatrix[0][1] * y;
    let rotatedY = rotationMatrix[1][0] * x + rotationMatrix[1][1] * y;

    return [rotatedX, rotatedY];
  }

  addShape(shape, angle, centerX, centerY) {
    const shapeToAdd = Simulation.shapes[shape];
    // Iterate through the cells in the shape pattern
    for (let i = 0; i < shapeToAdd.length; i++) {
      let x = shapeToAdd[i][0];
      let y = shapeToAdd[i][1];

      // Rotate the cell coordinates using the rotateCoords() helper function
      let rotatedCoords = this.rotateCoords(x, y, angle);
      let rotatedX = rotatedCoords[0];
      let rotatedY = rotatedCoords[1];

      // Convert the rotated cell coordinates to absolute grid coordinates
      let gridX = centerX + rotatedX - 1;
      let gridY = centerY + rotatedY - 1;

      // If cell in grid, toggle it's state
      if (
        gridX >= 0 &&
        gridX < Simulation.numColumns &&
        gridY >= 0 &&
        gridY < Simulation.numRows
      ) {
        let idx = this.gridToIndex(gridX, gridY);
        this.toggleCell(idx);
      }
    }

    this.draw();
  }

  cellsAlive() {
    return this.cells.filter((cell) => cell.alive).length;
  }
  cellsDead() {
    return this.cells.length - this.cellsAlive();
  }

  countCurrentCells() {
    let alive = this.cells.filter((cell) => cell.alive);
    this.alive = alive.length;
    this.dead = this.cells.length - this.alive;
  }

  isAlive(x, y) {
    if (
      x < 0 ||
      x >= Simulation.numColumns ||
      y < 0 ||
      y >= Simulation.numRows
    ) {
      return false;
    }

    return this.cells[this.gridToIndex(x, y)].alive ? 1 : 0;
  }

  gridToIndex(x, y) {
    return x + y * Simulation.numColumns;
  }

  checkSurrounding() {
    for (let x = 0; x < Simulation.numColumns; x++) {
      for (let y = 0; y < Simulation.numRows; y++) {
        // Count the nearby population
        let numAlive =
          this.isAlive(x - 1, y - 1) +
          this.isAlive(x, y - 1) +
          this.isAlive(x + 1, y - 1) +
          this.isAlive(x - 1, y) +
          this.isAlive(x + 1, y) +
          this.isAlive(x - 1, y + 1) +
          this.isAlive(x, y + 1) +
          this.isAlive(x + 1, y + 1);
        let centerIndex = this.gridToIndex(x, y);

        if (numAlive == 2) {
          // Do nothing
          this.cells[centerIndex].nextAlive = this.cells[centerIndex].alive;
        } else if (numAlive == 3) {
          // Make alive
          this.cells[centerIndex].nextAlive = true;
          if (!this.cells[centerIndex].alive) {
            this.totalBorn += 1;
          }
        } else {
          // Make dead
          this.cells[centerIndex].nextAlive = false;
          if (this.cells[centerIndex].alive) {
            this.totalDead += 1;
          }
        }
      }
    }

    // Apply the new state to the cells
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].alive = this.cells[i].nextAlive;
    }
  }

  drawCells() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].draw();
    }
  }

  drawStats() {
    this.context.font = Simulation.font;
    this.context.fillStyle = "white";
    this.context.fillText(
      `Generation: ${this.generation}`,
      10,
      1 * Simulation.textSpacing
    );
    this.context.fillText(
      `Alive: ${this.alive}`,
      10,
      2 * Simulation.textSpacing
    );
    this.context.fillText(
      `Total Births: ${this.totalBorn}`,
      10,
      3 * Simulation.textSpacing
    );
    this.context.fillText(`Dead: ${this.dead}`, 10, 4 * Simulation.textSpacing);
    this.context.fillText(
      `Total Deaths: ${this.totalDead}`,
      10,
      5 * Simulation.textSpacing
    );
  }

  draw() {
    this.countCurrentCells();
    this.drawCells();
    if (Simulation.displayStats) {
      this.drawStats();
    }
  }

  update() {
    this.checkSurrounding();

    this.generation += 1;
    this.draw();
  }

  run() {
    if (this.running) {
      this.update();

      // Keep requesting new frames
      setTimeout(() => {
        window.requestAnimationFrame(() => this.run());
      }, Simulation.refreshTime);
    }
  }
}

window.onload = () => {
  const canvas = document.getElementById("simCanvas");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("start-button");
  const stepButton = document.getElementById("step-button");
  const stopButton = document.getElementById("stop-button");
  const resetButton = document.getElementById("reset-button");
  const clearButton = document.getElementById("clear-button");
  const aliveColorSelector = document.getElementById("alive-color");
  const deadColorSelector = document.getElementById("dead-color");
  const displayStats = document.getElementById("statistics");
  const probabilitySlider = document.getElementById("probability");
  const refreshSlider = document.getElementById("refresh-time");
  const shapeSelector = document.getElementById("shape-selector");
  const angleSelector = document.getElementById("angle-select");

  const availableShapes = Object.keys(SHAPES);
  availableShapes.map((shape) => {
    let opt = document.createElement("option");
    opt.value = shape;
    opt.innerHTML = shape;
    shapeSelector.appendChild(opt);
  });

  let currentShape = shapeSelector.value;
  let simulation = new Simulation("simCanvas");

  window.addEventListener("resize", resizeCanvas, false);
  resizeCanvas();
  function resizeCanvas() {
    const fontRatio = 20 / 1024;
    canvas.width = Math.min(1024, window.innerWidth * 0.75);
    canvas.height = canvas.width * 1;
    Cell.height = canvas.height / Simulation.numRows;
    Cell.width = canvas.width / Simulation.numColumns;
    Simulation.font =
      (Math.max(14, canvas.width * fontRatio) | 0) + "px Optima";
    Simulation.textSpacing = Math.max(14, canvas.width * fontRatio * 1.1) | 0;
    simulation.draw();
  }

  startButton.addEventListener("click", () => {
    simulation.running = true;
    simulation.run();
  });

  stepButton.addEventListener("click", () => {
    simulation.running = false;
    simulation.update();
  });

  stopButton.addEventListener("click", () => {
    simulation.running = false;
  });

  resetButton.addEventListener("click", () => {
    simulation.running = false;
    simulation = new Simulation("simCanvas");
  });

  probabilitySlider.addEventListener("input", (e) => {
    Cell.aliveProbability = 1.0 - e.target.value;
    if (simulation.running) {
      return;
    }
    simulation = new Simulation("simCanvas");
  });

  clearButton.addEventListener("click", () => {
    const oldProb = Cell.aliveProbability;
    Cell.aliveProbability = 1.0;
    simulation.running = false;
    simulation = new Simulation("simCanvas");
    Cell.aliveProbability = oldProb;
  });

  aliveColorSelector.addEventListener("input", (e) => {
    Cell.aliveColor = e.target.value;
    simulation.draw();
  });

  deadColorSelector.addEventListener("input", (e) => {
    Cell.deadColor = e.target.value;
    simulation.draw();
  });

  displayStats.addEventListener("change", (e) => {
    Simulation.displayStats = e.target.checked;
    simulation.draw();
  });

  refreshSlider.addEventListener(
    "change",
    (e) => (Simulation.refreshTime = e.target.value)
  );

  shapeSelector.addEventListener(
    "change",
    (e) => (currentShape = e.target.value)
  );

  canvas.addEventListener("click", (e) => {
    if (simulation.running) {
      return;
    }

    // Convert screen-space mouse position to canvas-space
    let xVal = e.pageX - canvas.offsetLeft;
    let yVal = e.pageY - canvas.offsetTop;
    // Convert pixels to cell coordinates
    let x = Math.floor(xVal / Cell.width);
    let y = Math.floor(yVal / Cell.height);

    let currentAngle = angleSelector.value;
    console.log(currentAngle);

    simulation.addShape(currentShape, currentAngle, x, y);
  });
};
