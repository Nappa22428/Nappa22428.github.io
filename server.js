const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { time, timeStamp } = require("console");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const comPath = "COM4"; // change this depending on the server's port that is connected to the board
const cookieParser = require('cookie-parser')
const { SerialPort } = require('serialport')
app.use(cookieParser());
let GRID_SIZE = 100;
let gridData = Array(GRID_SIZE).fill("#FFFFFF"); // fill the grid with all white, so it is easy to visualize what pixels have been filled

const lastEditedCollection = new Map();

const serialPort = new SerialPort({
  path: comPath,
  baudRate: 9600,
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected, " + socket.id);
  socket.emit("setUpGraph", GRID_SIZE, gridData);

  socket.on("pixel-change", (data) => {
    const currentTimestamp = Date.now();
    // Update the gridData with the new color
    if (!lastEditedCollection.get(data.userID)) {
      lastEditedCollection.set(data.userID, currentTimestamp);
      gridData[data.index] = data.color;
      serialPort.write(JSON.stringify(data.index) + "," + data.color + "\n");
      console.log(JSON.stringify(data.index) + "," + data.color);
      io.emit("update-pixel", data);
      return;
    } else if (currentTimestamp - lastEditedCollection.get(data.userID) < 1) {
      console.log("Too short from last edit");
      return;
    } else {
      lastEditedCollection.set(data.userID, currentTimestamp);
      gridData[data.index] = data.color;
      serialPort.write(JSON.stringify(data.index) + "," + data.color + "\n");
      console.log(JSON.stringify(data.index) + "," + data.color);
      io.emit("update-pixel", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
