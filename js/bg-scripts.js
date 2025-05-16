/* static low-motion “code wall” */
const cvs = document.getElementById("matrix-bg");
const ctx = cvs.getContext("2d");
let W,H,codeLines=[];

const COLS = 50, ROWS = 30, SIZE = 28, SPEED = .015;
const glyphs = "{}/<>[]()*&^%$#@!;:01";

function resize(){
  W = cvs.width  = innerWidth;
  H = cvs.height = innerHeight;
  codeLines.length = 0;

  for(let c=0;c<COLS;c++){
    for(let r=0;r<ROWS;r++){
      const x = c*SIZE*0.9 + Math.random()*4;
      const y = r*SIZE*1.05;
      const ch = glyphs[Math.random()*glyphs.length|0];
      codeLines.push({x,y,ch,offset:Math.random()*Math.PI*2});
    }
  }
}
onresize = resize; resize();

function draw(t){
  requestAnimationFrame(draw);
  ctx.fillStyle = "rgba(11,23,42,.94)";
  ctx.fillRect(0,0,W,H);

  ctx.fillStyle = "#4ad5ff";
  ctx.font = "600 18px 'Source Code Pro', monospace";

  codeLines.forEach(g=>{
    const dx = Math.sin(t* SPEED + g.offset)*2;   // ±2 px drift
    ctx.fillText(g.ch, g.x+dx, g.y);
  });
}
requestAnimationFrame(draw);
