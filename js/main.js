/* ------------------------------------------------------------------ */
/*  1.  Vanta background                                               */
/* ------------------------------------------------------------------ */
if (window.VANTA && VANTA.NET) {
  VANTA.NET({
    el: "#vanta-bg",
    backgroundColor: 0x0b172a,
    color: 0x39a0ed,
    points: 30,
    maxDistance: 20,
    spacing: 20,
    showDots: true,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    scale: 1,
    scaleMobile: 1,
  });
}

/* ------------------------------------------------------------------ */
/*  2.  Floating code symbols                                          */
/* ------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  const codeBg = document.querySelector(".code-bg");
  const chars  = ["{","}","<",">","/",";","(",")","[","]","=","+","*","&","%","#"];

  for (let i = 0; i < 50; i++) {
    const span = document.createElement("span");
    span.className       = "code-char";
    span.textContent     = chars[Math.floor(Math.random() * chars.length)];
    span.style.left      = `${Math.random() * 100}vw`;
    span.style.fontSize  = `${20 + Math.random() * 30}px`;
    span.style.animationDuration = `${6 + Math.random() * 6}s`;
    span.style.color     = Math.random() < .5 ? "var(--color-accent1)" : "var(--color-accent2)";
    codeBg.appendChild(span);
  }

  /* ---------------------------------------------------------------- */
  /*  3.  Name intro                                                  */
  /* ---------------------------------------------------------------- */
  const nameEl = document.getElementById("name");
  nameEl.innerHTML = nameEl.textContent.trim().replace(/\S/g, "<span class='letter'>$&</span>");
  anime.timeline().add({
    targets: "#name .letter",
    translateY: [150,0],
    opacity   : [0,1],
    rotateX   : [90,0],
    scale     : [.3,1],
    easing    : "easeOutExpo",
    duration  : 700,
    delay     : (_,i) => 40 * i,
  });

  /* ---------------------------------------------------------------- */
  /*  4.  Build floating circles                                      */
  /* ---------------------------------------------------------------- */
  const hero = document.getElementById("vanta-bg");
  const triggerConfigs = [
    { key:"about",      label:"About Me",        xPct:15, yPct:30, color:"var(--color-accent1)" },
    { key:"history",    label:"Work History",    xPct:85, yPct:30, color:"var(--color-accent2)" },
    { key:"automation", label:"Workflow Eng.",   xPct:50, yPct:75, color:"var(--color-primary)"},
  ];

  const activeTweens = new Map();   // store current float tween for each circle

  /* == glow / scale helper ========================================= */
  function addCircleFX(circle){
    // hover / focus
    circle.addEventListener("pointerenter",()=>{
      gsap.to(circle,{scale:1.15,boxShadow:"0 0 18px rgba(255,255,255,.8)",duration:.25,overwrite:"auto"});
    });
    circle.addEventListener("pointerleave",()=>{
      gsap.to(circle,{scale:1,boxShadow:"0 0 0 rgba(0,0,0,0)",duration:.25,overwrite:"auto"});
    });
    // touch / mouse-down
    circle.addEventListener("pointerdown",()=>{
      gsap.to(circle,{scale:1.15,boxShadow:"0 0 18px rgba(255,255,255,.8)",duration:.2});
    });
    circle.addEventListener("pointerup",()=>{
      gsap.to(circle,{scale:1,boxShadow:"0 0 0 rgba(0,0,0,0)",duration:.25});
    });
  }

  triggerConfigs.forEach(cfg=>{
    const el = document.createElement("div");
    el.className = "trigger";
    el.dataset.popup = cfg.key;
    el.textContent   = cfg.label;
    el.style.background = cfg.color;
    hero.appendChild(el);
    addCircleFX(el);                           //  <<<  glow / scale

    const startX = cfg.xPct/100 * innerWidth;
    const startY = cfg.yPct/100 * innerHeight;
    gsap.set(el,{x:startX,y:startY});
    const tween = gsap.to(el,{
      x:startX + (Math.random()*40-20),
      y:startY + (Math.random()*30-15),
      duration:4+Math.random()*2,
      ease:"sine.inOut",
      repeat:-1,
      yoyo:true,
      delay:Math.random()*2,
    });
    activeTweens.set(el,tween);
  });

  /* ---------------------------------------------------------------- */
  /*  5.  Popup                                                       */
  /* ---------------------------------------------------------------- */
  const popupModal = document.getElementById("popupModal");
  const popupInner = document.getElementById("popupInner");
  const popupClose = document.getElementById("popupClose");
  const popupData  = {
    about:`
      <h3>About Me</h3>
      <p>I lead with imagination and let code keep pace. A relentlessly driven animator and award-winning filmmaker, I’ve scripted 30+ After Effects tools, built 2 extensions and 6 Python apps that clear the runway for fresh ideas to take flight…</p>`,
    history:`
      <h3>Work History</h3>
      <ul>
        <li>2016 – 2025 · Senior Motion Graphics & Automation Lead, AdMed</li>
        <li>2003 – Present · Freelance Creative Director</li>
        <li>2003 – 2008 · Owner, Bradford Sound Studios</li>
      </ul>`,
    automation:`
      <h3>Workflow Engineering</h3>
      <p>I design the machinery behind the magic: 30+ custom AE scripts, two production-ready extensions and six Python apps keep editors in flow while the pipeline handles the grunt work…</p>`
  };

  document.querySelectorAll(".trigger").forEach(btn=>{
    btn.addEventListener("click",()=>{
      popupInner.innerHTML = popupData[btn.dataset.popup] || "<p>(no content)</p>";
      popupModal.classList.add("open");
    });
  });
  popupClose.addEventListener("click",()=>popupModal.classList.remove("open"));
  popupModal.addEventListener("click",e=>{
    if(e.target===popupModal) popupClose.click();
  });

  /* ---------------------------------------------------------------- */
  /*  6.  Video-modal (unchanged)                                     */
  /* ---------------------------------------------------------------- */
  const vModal = document.getElementById("videoModal");
  const vPlayer= document.getElementById("modalVideo");
  const vClose = document.getElementById("closeModal");
  document.querySelectorAll(".video-thumb").forEach(thumb=>{
    thumb.addEventListener("click",()=>{
      vPlayer.src = thumb.dataset.src;
      vModal.classList.add("open");
    });
  });
  if(vClose){
    vClose.addEventListener("click",()=>{
      vModal.classList.remove("open");
      vPlayer.pause(); vPlayer.currentTime = 0;
    });
    vModal.addEventListener("click",e=>{
      if(e.target===vModal) vClose.click();
    });
  }

  /* ---------------------------------------------------------------- */
  /*  7.  Drag-to-reposition (all devices)                            */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll(".trigger").forEach(circle=>{
    circle.style.touchAction = "none";

    circle.addEventListener("pointerdown",e=>{
      const old = activeTweens.get(circle); if(old) old.kill();

      const startX = e.clientX, startY = e.clientY;
      const bcr = circle.getBoundingClientRect();
      const offX = startX - bcr.left, offY = startY - bcr.top;

      function onMove(ev){
        gsap.set(circle,{x:ev.clientX-offX,y:ev.clientY-offY});
        ev.preventDefault();
      }
      function onUp(){
        respawnFloat(circle);
        removeEventListener("pointermove",onMove);
        removeEventListener("pointerup",onUp);
      }
      addEventListener("pointermove",onMove,{passive:false});
      addEventListener("pointerup",onUp);
    });
  });

  /* keep circles safely onscreen on resize / rotation -------------- */
  function clamp(v,min,max){ return Math.min(Math.max(v,min),max); }
  function respawnFloat(c){
    const old = activeTweens.get(c); if(old) old.kill();
    const b   = c.getBoundingClientRect();
    const x   = clamp(b.left ,8,innerWidth  -b.width -8);
    const y   = clamp(b.top  ,8,innerHeight -b.height-8);
    gsap.set(c,{x,y});
    const t = gsap.to(c,{
      x: x + (Math.random()*40-20),
      y: y + (Math.random()*30-15),
      duration:4+Math.random()*2,
      ease:"sine.inOut",
      repeat:-1,
      yoyo:true
    });
    activeTweens.set(c,t);
  }
  addEventListener("resize",()=>document.querySelectorAll(".trigger").forEach(respawnFloat));

  // grab the modal + inner elements
  const demoModal   = document.getElementById('demoModal');
  const demoIframe  = document.getElementById('demoIframe');
  const demoClose   = document.getElementById('demoClose');

  // delegate clicks on “Watch Demo” buttons
  document.querySelector('.card-grid').addEventListener('click', e => {
    const btn = e.target.closest('.watch-demo');
    if (!btn) return;

    // set the iframe src (will start playback if autoplay=1)
    demoIframe.src = btn.dataset.video;
    demoModal.classList.add('open');
  });

  // close handlers
  demoClose.addEventListener('click', () => {
    demoModal.classList.remove('open');
    demoIframe.src = ''; // unload video
  });
  demoModal.addEventListener('click', e => {
    // click outside content also closes
    if (e.target === demoModal) demoClose.click();
  });

  
});
