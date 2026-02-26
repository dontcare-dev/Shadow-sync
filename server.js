const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

io.on("connection", socket => {
  players[socket.id] = { x: 400, y: 300 };
  socket.emit("init", players);
  socket.broadcast.emit("join", { id: socket.id, p: players[socket.id] });

  socket.on("move", d => {
    if (!players[socket.id]) return;
    players[socket.id].x += d.dx;
    players[socket.id].y += d.dy;
    io.emit("update", { id: socket.id, p: players[socket.id] });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("leave", socket.id);
  });
});

server.listen(process.env.PORT || 3000);