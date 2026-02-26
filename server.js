const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  players[socket.id] = {
    x: Math.random() * 500,
    y: Math.random() * 500
  };

  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    player: players[socket.id]
  });

  socket.on("move", (data) => {
    if (!players[socket.id]) return;
    players[socket.id].x += data.dx;
    players[socket.id].y += data.dy;
    io.emit("playerMoved", { id: socket.id, player: players[socket.id] });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});