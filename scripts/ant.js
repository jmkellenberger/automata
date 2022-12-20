// ant = new Image();
// ant.onload = function () {
//     ctx.drawImage(ant, 0, 0, 50, 50);
// };

// ant.src = "../images/ant.png"
class Square {
  constructor(
    x = 0,
    y = 0,
    size = 50,
    fillColor = "white",
    strokeColor = "black",
    strokeWidth = 1
  ) {
    this.x = Number(x);
    this.y = Number(y);
    this.size = Number(size);
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;
  }

  get area() {
    return size ^ 2;
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x + this.size;
  }

  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + this.size;
  }

  draw(ctx) {
    ctx.save();

    ctx.fillStyle = this.fillColor;
    ctx.lineWidth = this.strokeWidth;

    ctx.beginPath();
    ctx.strokeStyle = this.strokeColor;
    ctx.rect(this.x, this.y, this.size, this.size);

    ctx.fill();
    ctx.stroke();
  }
}

class Grid {
  constructor(size, canvas) {
    this.size = Number(size);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cells = [];
    this.cell_size = canvas.width / size;
  }

  createGrid() {
    for (var row = 0; row < this.size; row++) {
      var x = 0 + row * this.cell_size;
      var cells = [];
      for (var col = 0; col < this.size; col++) {
        var y = 0 + col * this.cell_size;
        var cell = new Square(x, y, this.cell_size);

        cells.push(cell);
      }
      this.cells.push(cells);
    }
  }

  draw() {
    this.cells.forEach((row) => row.forEach((cell) => cell.draw(this.ctx)));
  }

  swapColor(x, y) {
    const cell = this.cells[x][y];
    if (cell.fillColor == "white") {
      cell.fillColor = "black";
    } else {
      cell.fillColor = "white";
    }
    this.cells[x][y] = cell;
    this.draw();
  }
}
const canvas = document.getElementById("simCanvas");
const size = 40;

board = new Grid(size, canvas);
board.createGrid();
board.draw();
canvas.addEventListener("click", function (event) {
  var xVal = event.pageX - canvas.offsetLeft;
  var yVal = event.pageY - canvas.offsetTop;

  var xCoord = Math.floor(xVal / (canvas.width / size));
  var yCoord = Math.floor(yVal / (canvas.width / size));
  console.log(xCoord, yCoord);
  board.swapColor(xCoord, yCoord);
});
