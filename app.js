const express = require("express");
const socket = require("socket.io");
const { Chess } = require("chess.js");
const http = require("http");
const path = require("path");
const { title } = require("process");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const players = {};
const currentPlayer = "w";
//basic server
app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});
//socket io code
io.on("connection", function (socket) {
  console.log("Connected");

  if (!players.white) {
    players.white = socket.id;
    socket.emit("Player", "w");
  } else if (!players.white) {
    players.black = socket.id;
    socket.emit("Player", "b");
  } else {
    socket.emit("Spectator");
  }

  socket.on("disconnect", function () {
    if (socket.id === players.white) {
      delete players.white;
    } else if (socket.id === players.black) {
      delete players.black;
    }
  });

  socket.on("move", (move) => {
    try {
      if (chess.turn == "w" && socket.id !== players.white) return;
      if (chess.turn == "b" && socket.id !== players.black) return;

      let result = chess.move(move);

      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("BoaredState", chess.fen());
      } else {
        socket.emit("Invalid move", move);
      }
    } catch (error) {
      console.error(error);
      
      socket.emit("Invalid move", move);
    }
  });
});
console.log(players);

server.listen(3000, function () {
  console.log("App listening");
});
