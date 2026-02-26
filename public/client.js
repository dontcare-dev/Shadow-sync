const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let players = {};

socket.on("currentPlayers", (data) => players = data);
socket.on("newPlayer", (data) => players[data.id] = data.player);
socket.on("playerMoved", (data) => players[data.id] = data.player);
socket.on("playerDisconnected", (id) => delete players[id]);

document.addEventListener("keydown", (e) => {
  let dx = 0, dy = 0;
  if (e.key === "w") dy = -5;
  if (e.key === "s") dy = 5;
  if (e.key === "a") dx = -5;
  if (e.key === "d") dx = 5;
  socket.emit("move", { dx, dy });
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const id in players) {
    ctx.fillStyle = "cyan";
    ctx.fillRect(players[id].x, players[id].y, 20, 20);
  }
  requestAnimationFrame(draw);
}
draw();