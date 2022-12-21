class Cell {
  static aliveColor = "#ff8080";
  static deadColor = "#303030";
  static width = 10;
  static height = 10;

  constructor(context, gridX, gridY) {
    this.context = context;

    this.gridX = gridX;
    this.gridY = gridY;

    this.alive = Math.random() > 0.5;
  }

  draw() {
    this.context.fillStyle = this.alive ? Cell.aliveColor : Cell.deadColor;
    this.context.fillRect(
      this.gridX * Cell.width,
      this.gridY * Cell.height,
      Cell.width,
      Cell.height
    );
  }
}

class Simulation {
  static numColumns = 80;
  static numRows = 80;

  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.cells = [];

    this.createGrid();

    this.running = false;

    // Request an animation frame for the first time
    window.requestAnimationFrame(() => this.update());
  }

  createGrid() {
    for (let y = 0; y < Simulation.numRows; y++) {
      for (let x = 0; x < Simulation.numColumns; x++) {
        this.cells.push(new Cell(this.context, x, y));
      }
    }
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
        } else {
          // Make dead
          this.cells[centerIndex].nextAlive = false;
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

  update() {
    this.checkSurrounding();

    this.drawCells();
  }

  run() {
    if (this.running) {
      this.update();

      // Keep requesting new frames
      setTimeout(() => {
        window.requestAnimationFrame(() => this.run());
      }, 100);
    }
  }
}

window.onload = () => {
  const canvas = document.getElementById("simCanvas");
  const startButton = document.getElementById("start-button");
  const stepButton = document.getElementById("step-button");
  const stopButton = document.getElementById("stop-button");
  const resetButton = document.getElementById("reset-button");
  const clearButton = document.getElementById("clear-button");
  const aliveColorSelector = document.getElementById("alive-color");
  const deadColorSelector = document.getElementById("dead-color");

  let simulation = new Simulation("simCanvas");

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

  clearButton.addEventListener("click", () => {
    simulation.running = false;
    simulation.cells = simulation.cells.map((cell) => {
      cell.alive = false;
      return cell;
    });
    simulation.update();
  });

  aliveColorSelector.addEventListener("input", (e) => {
    const color = e.target.value;
    Cell.aliveColor = color;
    simulation.drawCells();
  });

  deadColorSelector.addEventListener("input", (e) => {
    const color = e.target.value;
    Cell.deadColor = color;
    simulation.drawCells();
  });

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

    // Convert cell coordinate to cell index
    let idx = x + y * Simulation.numColumns;
    let cell = simulation.cells[idx];

    // Swap state on click
    if (cell.alive) {
      cell.alive = false;
    } else {
      cell.alive = true;
    }
    cell.draw();
  });
};
