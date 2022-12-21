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
  static numColumns = 80;
  static numRows = 80;

  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.cells = [];
    this.generation = 0;
    this.alive = 0;
    this.dead = 0;

    this.running = false;
    this.displayStats = true;

    this.createGrid();
    this.countCells;
    window.requestAnimationFrame(() => this.draw());
  }

  createGrid() {
    for (let y = 0; y < Simulation.numRows; y++) {
      for (let x = 0; x < Simulation.numColumns; x++) {
        this.cells.push(new Cell(this.context, x, y));
      }
    }
  }

  countCells() {
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

  drawStats() {
    this.context.font = "18px Optima";
    this.context.fillStyle = "white";
    this.context.fillText(`Generations: ${this.generation}`, 10, 20);
    this.context.fillText(`Cells Alive: ${this.alive}`, 10, 40);
    this.context.fillText(`Cells Dead: ${this.dead}`, 10, 60);
  }

  draw() {
    this.countCells();
    this.drawCells();
    if (this.displayStats) {
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
  const displayStats = document.getElementById("statistics");
  const probabilitySlider = document.getElementById("probability");

  let simulation = new Simulation("simCanvas");

  window.addEventListener("resize", resizeCanvas, false);
  resizeCanvas();
  function resizeCanvas() {
    canvas.width = Math.min(1024, window.innerWidth * 0.75);
    canvas.height = canvas.width * 1;
    Cell.height = canvas.height / Simulation.numRows;
    Cell.width = canvas.width / Simulation.numColumns;
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
    simulation.displayStats = e.target.checked;
    simulation.draw();
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
    let idx = simulation.gridToIndex(x, y);
    let cell = simulation.cells[idx];

    // Swap state on click
    if (cell.alive) {
      cell.alive = false;
    } else {
      cell.alive = true;
    }
    simulation.draw();
  });
};
