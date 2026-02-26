const socket = io();
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const TILE = 64;
const MAP = [
 [1,1,1,1,1,1,1,1,1,1],
 [1,0,0,0,0,0,0,2,0,1],
 [1,0,1,1,0,1,0,0,0,1],
 [1,0,0,0,0,0,0,0,0,1],
 [1,0,1,0,1,1,1,0,0,1],
 [1,0,0,0,0,2,0,0,0,1],
 [1,1,1,1,1,1,1,1,1,1]
];

let players = {}, myId = null, t = 0;

socket.on("init", p => { players = p; myId = socket.id; });
socket.on("join", d => players[d.id] = d.p);
socket.on("update", d => players[d.id] = d.p);
socket.on("leave", id => delete players[id]);

function wall(x,y){
  const c = Math.floor(x/TILE), r = Math.floor(y/TILE);
  return MAP[r] && MAP[r][c] === 1;
}

function move(dx,dy){
  const p = players[myId];
  if(!p) return;
  let nx = p.x+dx, ny = p.y+dy;
  if(!wall(nx,p.y)) p.x=nx;
  if(!wall(p.x,ny)) p.y=ny;
  socket.emit("move",{dx,dy});
}

/* Mobile joystick */
const joy=document.getElementById("joystick");
const stick=document.getElementById("stick");
let drag=false;

joy.ontouchstart=()=>drag=true;
joy.ontouchend=()=>{drag=false;stick.style.left="35px";stick.style.top="35px";}
joy.ontouchmove=e=>{
 if(!drag) return;
 const r=joy.getBoundingClientRect(),tch=e.touches[0];
 let x=tch.clientX-r.left-60,y=tch.clientY-r.top-60;
 x=Math.max(-30,Math.min(30,x));y=Math.max(-30,Math.min(30,y));
 stick.style.left=x+35+"px";stick.style.top=y+35+"px";
 move(x/5,y/5);
};

function drawMap(cx,cy){
 for(let r=0;r<MAP.length;r++)
  for(let c=0;c<MAP[r].length;c++){
   let x=c*TILE-cx,y=r*TILE-cy;
   if(MAP[r][c]==1){
    ctx.fillStyle="#0b1020";
    ctx.fillRect(x,y,TILE,TILE);
   }
   if(MAP[r][c]==2){
    let p=Math.sin(t/15)*.3+.6;
    ctx.fillStyle=`rgba(255,0,255,${p})`;
    ctx.fillRect(x+8,y+8,TILE-16,TILE-16);
   }
  }
}

function draw(){
 t++;
 ctx.clearRect(0,0,canvas.width,canvas.height);
 const me=players[myId];
 if(!me) return requestAnimationFrame(draw);
 const cx=me.x-canvas.width/2, cy=me.y-canvas.height/2;
 drawMap(cx,cy);

 for(let id in players){
  const p=players[id];
  const x=p.x-cx,y=p.y-cy;

  // glitch shadow
  ctx.fillStyle="rgba(0,255,255,.15)";
  ctx.fillRect(x+4,y+4,32,32);

  ctx.shadowBlur=25;
  ctx.shadowColor=id===myId?"cyan":"red";
  ctx.fillStyle=id===myId?"cyan":"red";
  ctx.fillRect(x,y,32,32);
 }
 ctx.shadowBlur=0;
 requestAnimationFrame(draw);
}
draw();