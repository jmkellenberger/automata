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

  addCell(x, y) {
    let idx = this.gridToIndex(x, y);
    let cell = this.cells[idx];

    // Swap state on click
    if (cell.alive) {
      cell.alive = false;
      this.totalDead += 1;
    } else {
      cell.alive = true;
      this.totalBorn += 1;
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

    simulation.addCell(x, y);
  });
};
