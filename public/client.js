const socket = io.connect();

let isMouseDown = false;
// let GRID_SIZE = 100; // change this to what you want the number of pixels to be.

// Generates a grid using the GRID_SIZE and column number from the css stylesheet.
const grid = document.getElementById("grid");
socket.on("setUpGraph", (GRID_SIZE, data) => {
  for (let i = 0; i < GRID_SIZE; i++) {
    console.log("Creating grid dot");
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    // Color the cell based on the data from the server
    colorCellOnSetup(cell, data[i]);
    cell.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      colorCell(e.target); // Color the cell immediately on mousedown
    });
    cell.addEventListener("mouseover", (e) => {
      if (isMouseDown) {
        // Only color if the mouse is held down
        colorCell(e.target);
      }
    });
    cell.addEventListener("mouseup", () => {
      isMouseDown = false;
    });
    grid.appendChild(cell);
  }
});

adjustGridSize();
window.addEventListener("resize", adjustGridSize);

function adjustGridSize() {
  const grid = document.getElementById("grid");
  const size = Math.min(window.innerWidth, window.innerHeight);
  grid.style.width = `${size}px`;
  grid.style.height = `${size}px`;
}

socket.on("update-pixel", (data) => {
  const cell = document.querySelector(`.cell[data-index='${data.index}']`);
  if (cell) {
    cell.style.backgroundColor = data.color;
  }
});

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

document.addEventListener("mouseup", () => {
  isMouseDown = false;
});

function colorCell(cell) {
  const colorPicker = document.getElementById("colorPicker");
  const color = colorPicker.value;
  // cell.style.backgroundColor = color;
  socket.emit("pixel-change", {
    index: parseInt(cell.dataset.index),
    color: color,
    userID: socket.id,
  });
}

function colorCellOnSetup(cell, color) {
  cell.style.backgroundColor = color;
}
