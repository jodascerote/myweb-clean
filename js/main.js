/* =========================
   main.js — full bundle
   ========================= */

/* ========= nav & smooth scroll ========= */
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('.site-nav');
const nav = document.querySelector('.nav-links');
const toggle = document.querySelector('.nav-toggle');

if (toggle){
  toggle.addEventListener('click', ()=> {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=> {
    nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false');
  }));
}

const OFFSET = () => header.getBoundingClientRect().height + 10;
function smoothScrollTo(target){
  const el = document.querySelector(target); if (!el) return;
  const y = el.getBoundingClientRect().top + scrollY - OFFSET();
  prefersReduced ? scrollTo(0, y) : scrollTo({ top:y, behavior:'smooth' });
}
document.querySelectorAll('[data-scroll]').forEach(a=>{
  a.addEventListener('click', e=>{
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')){
      e.preventDefault();
      smoothScrollTo(href);
      history.replaceState(null,'',href);
    }
  });
});

const sections = [...document.querySelectorAll('section[id]')];
const links = [...document.querySelectorAll('.nav-links a')];
function setActiveLink(){
  const fromTop = scrollY + OFFSET() + 1;
  let current = sections[0]?.id;
  for (const sec of sections) if (sec.offsetTop <= fromTop) current = sec.id;
  links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${current}`));
}
setActiveLink(); addEventListener('scroll', setActiveLink, {passive:true});

/* ========= split text / reveal ========= */
function splitText(selector='.split'){
  document.querySelectorAll(selector).forEach(el=>{
    if (el.dataset.split) return; el.dataset.split='1';
    const text = el.textContent; el.textContent = '';
    [...text].forEach((ch,i)=>{
      const span = document.createElement('span');
      span.className = 'split-char';
      if (ch === ' ') { span.classList.add('space'); span.innerHTML='&nbsp;'; }
      else { span.textContent = ch; }
      const jitter = Math.random()*0.05;
      span.style.transitionDelay = ((i*0.03)+jitter).toFixed(3)+'s';
      el.appendChild(span);
    });
  });
}
splitText();

const revealables = [...document.querySelectorAll('.reveal'), ...document.querySelectorAll('.split')];
if (!prefersReduced && 'IntersectionObserver' in window){
  const io = new IntersectionObserver((entries)=>{
    for (const e of entries) if (e.isIntersecting){ e.target.classList.add('is-inview'); io.unobserve(e.target); }
  }, { rootMargin:'0px 0px -10% 0px', threshold:0.1 });
  revealables.forEach(el => io.observe(el));
} else {
  revealables.forEach(el => el.classList.add('is-inview'));
}

/* ========= counters ========= */
function animateCounter(el){
  const target = Number(el.getAttribute('data-counter')||0);
  let start = 0; const dur = 900; const t0 = performance.now();
  function step(t){ const k = Math.min(1, (t - t0)/dur); const ease = 1 - Math.pow(1 - k, 3);
    el.textContent = Math.round(start + (target - start)*ease).toLocaleString();
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
document.querySelectorAll('[data-counter]').forEach(el=>{
  if (prefersReduced){ el.textContent = Number(el.getAttribute('data-counter')); return; }
  const io = new IntersectionObserver(es=>{ for (const e of es) if (e.isIntersecting){ animateCounter(el); io.disconnect(); } }, {threshold:0.6});
  io.observe(el);
});

/* ========= keep hero title on one line ========= */
(function fitTitle(){
  const el = document.getElementById('title'); if (!el) return;
  let prevW = 0;
  function fit(){
    const parent = el.parentElement; const w = parent?.clientWidth || 0;
    if (w < 10) return; if (Math.abs(w - prevW) < 8) return; prevW = w;
    const MAX = 84, MIN = 18;
    let size = Math.min(MAX, Math.max(MIN, Math.round(w * 0.072)));
    el.style.fontSize = size + 'px'; el.style.transform = 'none';
    if (el.scrollWidth <= w) return;
    let guard = 0;
    while (el.scrollWidth > w && size > MIN && guard < 120){ size -= 1; guard++; el.style.fontSize = size + 'px'; }
    if (el.scrollWidth > w){
      const ratio = Math.max(0.7, w / el.scrollWidth);
      el.style.transform = `scale(${ratio})`; el.style.transformOrigin = 'center top';
    }
  }
  fit(); addEventListener('resize', fit, {passive:true});
})();

/* ========= video modal ========= */
const videoModal = document.getElementById('videoModal');
const modalInner = videoModal.querySelector('.modal-inner');
function openVideo(id){
  if (!id) return;
  const src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  modalInner.innerHTML = `<iframe src="${src}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="width:100%;height:100%;border:0"></iframe>`;
  document.body.classList.add('modal-open');
  videoModal.classList.add('open'); videoModal.setAttribute('aria-hidden','false');
}
function closeVideo(){
  videoModal.classList.remove('open'); videoModal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open'); modalInner.innerHTML = '';
}
videoModal.addEventListener('click', e=>{ if (e.target.hasAttribute('data-close')) closeVideo(); });
addEventListener('keydown', e=>{ if (e.key === 'Escape' && videoModal.classList.contains('open')) closeVideo(); });
document.querySelectorAll('[data-video]').forEach(el=> el.addEventListener('click', e=>{ e.preventDefault(); openVideo(el.getAttribute('data-video')); }));

/* ========= section FX (nebula / code / net) ========= */
(function sectionFX(){
  if (prefersReduced) return;

  const DPR = Math.min(2, devicePixelRatio || 1);
  const targetFPS = 30, minDt = 1000/targetFPS;

  class FXBase{
    constructor(canvas,hues){
      this.c = canvas; this.x = canvas.getContext('2d');
      if (!this.x) return;
      this.hues = hues; this._raf = 0; this._last = 0; this.t = 0;
      this.resize();
    }
    rect(){ return this.c.parentElement.getBoundingClientRect(); }
    resize(){
      const r = this.rect();
      this.c.width  = Math.max(1, Math.floor(r.width  * DPR));
      this.c.height = Math.max(1, Math.floor(r.height * DPR));
    }
    start(){
      if (!this.x) return;
      cancelAnimationFrame(this._raf);
      const loop = (ts)=>{
        this._raf = requestAnimationFrame(loop);
        if (!this._last || ts - this._last >= minDt){
          this._last = ts; this.t += 1/30; this.draw();
        }
      };
      this._raf = requestAnimationFrame(loop);
    }
    stop(){ cancelAnimationFrame(this._raf); this._raf = 0; }
    rand(a,b){ return a + Math.random()*(b-a); }
  }

  /* ---- Nebula ---- */
  class NebulaFX extends FXBase{
    constructor(c,h){ super(c,h); this.blobs=[]; this.nodes=[]; this.setup(); }
    setup(){
      const w = this.c.width, h = this.c.height;
      const bc = w>1600?7:w>980?6:5;
      this.blobs = [...Array(bc)].map(()=>({
        x:this.rand(0,w), y:this.rand(0,h),
        r:this.rand(150*DPR,280*DPR), a:this.rand(.05,.09),
        vx:this.rand(-.10,.10)*DPR, vy:this.rand(-.09,.09)*DPR,
        hue:this.rand(this.hues[0], this.hues[1])
      }));
      const nc = w>1600?52:w>980?44:34;
      this.nodes = [...Array(nc)].map(()=>({
        x:this.rand(0,w), y:this.rand(0,h),
        vx:this.rand(-.04,.04)*DPR, vy:this.rand(-.04,.04)*DPR
      }));
    }
    draw(){
      const g=this.x, w=this.c.width, h=this.c.height;
      g.globalCompositeOperation='source-over';
      g.fillStyle='rgba(9,11,18,0.18)'; g.fillRect(0,0,w,h);

      for (const b of this.blobs){
        b.x+=b.vx; b.y+=b.vy;
        if (b.x < -b.r) b.x = w + b.r; if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r; if (b.y > h + b.r) b.y = -b.r;
        const grad = g.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
        grad.addColorStop(0,`hsla(${b.hue},100%,60%,${b.a})`);
        grad.addColorStop(1,`hsla(${b.hue},100%,50%,0)`);
        g.globalCompositeOperation='lighter';
        g.fillStyle=grad; g.beginPath(); g.arc(b.x,b.y,b.r,0,Math.PI*2); g.fill();
      }

      g.globalCompositeOperation='source-over'; g.lineWidth=1;
      for (let i=0;i<this.nodes.length;i++){
        const n=this.nodes[i]; n.x+=n.vx; n.y+=n.vy;
        if(n.x<0||n.x>w) n.vx*=-1; if(n.y<0||n.y>h) n.vy*=-1;
        g.fillStyle='rgba(180,200,255,0.10)'; g.beginPath(); g.arc(n.x,n.y,1.2,0,Math.PI*2); g.fill();
        for (let j=i+1;j<this.nodes.length;j++){
          const m=this.nodes[j], dx=n.x-m.x, dy=n.y-m.y, d2=dx*dx+dy*dy;
          if (d2 < 90*90){
            const a = 0.06 * (1 - Math.sqrt(d2)/90);
            g.strokeStyle = `rgba(160,190,255,${a})`;
            g.beginPath(); g.moveTo(n.x,n.y); g.lineTo(m.x,m.y); g.stroke();
          }
        }
      }
    }
    resize(){ super.resize(); this.setup(); }
  }

  /* ---- Net (LIGHT) — for sections like #contact where color needs to shine ---- */
  class NetFXLight extends FXBase{
    constructor(c,h){ super(c,h); this.points=[]; this.setup(); }
    setup(){
      const w=this.c.width,h=this.c.height;
      const count = w>1600?80:w>980?64:48;
      this.points=[...Array(count)].map(()=>({
        x:this.rand(0,w), y:this.rand(0,h),
        vx:this.rand(-.06,.06), vy:this.rand(-.06,.06)
      }));
    }
    draw(){
      const g=this.x, w=this.c.width, h=this.c.height;
      g.fillStyle='rgba(255,255,255,0.05)'; g.fillRect(0,0,w,h);

      const hueA=this.hues[0], hueB=this.hues[1];
      const grad=g.createLinearGradient(0,0,w,0);
      grad.addColorStop(0,`hsla(${hueA},100%,70%,0.07)`);
      grad.addColorStop(1,`hsla(${hueB},100%,70%,0.07)`);
      g.fillStyle=grad; g.fillRect(0,0,w,h);

      g.fillStyle='rgba(160,190,255,0.12)'; g.strokeStyle='rgba(160,190,255,0.12)'; g.lineWidth=1;

      for (let i=0;i<this.points.length;i++){
        const p=this.points[i];
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>w) p.vx*=-1;
        if(p.y<0||p.y>h) p.vy*=-1;

        g.beginPath(); g.arc(p.x,p.y,1.6,0,Math.PI*2); g.fill();

        for (let j=i+1;j<this.points.length;j++){
          const q=this.points[j], dx=p.x-q.x, dy=p.y-q.y, d2=dx*dx+dy*dy;
          const R=120;
          if (d2 < R*R){
            const a=0.14*(1-Math.sqrt(d2)/R);
            g.strokeStyle=`rgba(160,190,255,${a})`;
            g.beginPath(); g.moveTo(p.x,p.y); g.lineTo(q.x,q.y); g.stroke();
          }
        }
      }
    }
  }

  /* ---- Net (DARK) — only for #work ---- */
  class NetFXDark extends FXBase{
    constructor(c,h){ super(c,h); this.points=[]; this.setup(); }
    setup(){
      const w=this.c.width,h=this.c.height;
      const count = w>1600?110:w>980?92:74;
      this.points=[...Array(count)].map((_,i)=>({
        x:this.rand(0,w), y:this.rand(0,h),
        layer: i%2,
        vx:this.rand(-.05,.05)*(i%2?1.8:0.7),
        vy:this.rand(-.05,.05)*(i%2?1.8:0.7),
        tw: Math.random()*Math.PI*2
      }));
    }
    draw(){
      const g=this.x, w=this.c.width, h=this.c.height, t=this.t;
      g.fillStyle='rgba(6,8,12,0.55)'; g.fillRect(0,0,w,h);

      const hueA=this.hues[0], hueB=this.hues[1];
      const sweep = (Math.sin(t*0.25)+1)/2;
      const grad=g.createLinearGradient(w*sweep*-0.3,0,w*(1+sweep*0.3),0);
      grad.addColorStop(0,`hsla(${hueA},100%,65%,0.10)`);
      grad.addColorStop(1,`hsla(${hueB},100%,65%,0.10)`);
      g.fillStyle=grad; g.fillRect(0,0,w,h);

      for (let i=0;i<this.points.length;i++){
        const p=this.points[i];
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>w) p.vx*=-1;
        if(p.y<0||p.y>h) p.vy*=-1;

        const twinkle = 0.10 + 0.10*Math.abs(Math.sin(t*0.8 + p.tw));
        g.fillStyle=`rgba(160,190,255,${twinkle})`;
        g.beginPath(); g.arc(p.x,p.y, p.layer?1.8:1.2, 0,Math.PI*2); g.fill();

        const R = p.layer?150:110;
        for (let j=i+1;j<this.points.length;j++){
          const q=this.points[j], dx=p.x-q.x, dy=p.y-q.y, d2=dx*dx+dy*dy;
          if (d2 < R*R){
            const a=(p.layer?0.18:0.12)*(1-Math.sqrt(d2)/R);
            g.strokeStyle=`rgba(160,190,255,${a})`;
            g.lineWidth = p.layer?1.2:1.0;
            g.beginPath(); g.moveTo(p.x,p.y); g.lineTo(q.x,q.y); g.stroke();
          }
        }
      }
    }
  }

  /* ---- Code rain ---- */
  class CodeFX extends FXBase{
    constructor(c,h){ super(c,h); this.columns=[]; this.glyphs="{}[]()<>=+-*/;:.|01"; this.setup(); }
    setup(){
      const w = this.c.width, h = this.c.height;
      const charSize = 14;
      const cols = Math.floor(w / (charSize*0.9));
      this.columns = [...Array(cols)].map((_,i)=>({
        x: Math.floor(i*charSize*0.9) + 2,
        y: Math.random()*-h,
        speed: 40 + Math.random()*55,
        size: charSize
      }));
      this.font = `${charSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    }
    draw(){
      const g=this.x, w=this.c.width, h=this.c.height;
      g.fillStyle='rgba(255,255,255,0.05)'; g.fillRect(0,0,w,h);
      g.font = this.font; g.textBaseline='top';
      const hueA=this.hues[0], hueB=this.hues[1];

      for (const col of this.columns){
        col.y += col.speed * (1/30);
        if (col.y > h + 20){ col.y = Math.random()*-h*0.5; }
        const strLen = 6 + Math.floor(Math.random()*8);
        for (let k=0;k<strLen;k++){
          const ch = this.glyphs[Math.floor(Math.random()*this.glyphs.length)];
          const y = col.y - k*col.size;
          const mix = (k/strLen);
          const hue = hueA + (hueB - hueA)*mix;
          this.x.fillStyle = `hsla(${hue},100%,70%,${0.10 + mix*0.12})`;
          this.x.fillText(ch, col.x, y);
        }
      }
    }
    resize(){ super.resize(); this.setup(); }
  }

  function make(c){
    const hues = (c.dataset.hues||'200,310').split(',').map(Number);
    const type = c.dataset.fx;

    if (type === 'code')   return new CodeFX(c,hues);
    if (type === 'nebula') return new NebulaFX(c,hues);
    if (type === 'net') {
      const section = c.closest('section');
      return (section && section.id === 'work')
        ? new NetFXDark(c,hues)
        : new NetFXLight(c,hues);
    }
    return new NetFXLight(c,hues);
  }

  const canvases = [...document.querySelectorAll('.fx')];
  const io = new IntersectionObserver((entries)=>{
    for (const e of entries){
      const fx = e.target.__fx || (e.target.__fx = make(e.target));
      if (e.isIntersecting){ fx.resize(); fx.start(); }
      else { fx.stop(); }
    }
  }, { threshold: 0.1 });

  canvases.forEach(c=>{
    if (c.dataset.persist === 'true'){
      c.__fx = make(c); c.__fx.start();
      addEventListener('resize', ()=> c.__fx && c.__fx.resize(), {passive:true});
    }else{
      io.observe(c);
    }
  });
})();

/* ========= ABOUT: single-row bubble lane — JS marquee (loop, no overlap, fades) ========= */
(function aboutBubbles(){
  if (prefersReduced) return;
  const lane = document.getElementById('about-bubbles');
  const toggleBtn = document.getElementById('bubbleToggle');
  if (!lane || !toggleBtn) return;

  const LABELS = [
    'MOA','Medical e-learning','AE scripting','Storyboarding','C4D',
    'Pipeline automation','E-learning UI','mRNA','Immuno-oncology'
  ];

  const SPEED = 110;   // px / second
  const GAP   = 52;    // min spacing between chips
  const PAD   = 140;   // offscreen padding
  const FADE  = 160;   // fade at edges (px)

  let bubbles = [];
  let nextIdx = 0;
  let running = true;
  let raf = 0, lastT = 0;

  function setButton(){
    toggleBtn.textContent = running ? 'Pause' : 'Play';
    toggleBtn.setAttribute('aria-pressed', String(!running));
  }

  function make(label){
    const el = document.createElement('div');
    el.className = 'bubble';
    el.textContent = label;
    lane.appendChild(el);
    const w = Math.ceil(el.getBoundingClientRect().width) + 6;
    return { el, w, x: 0 };
  }

  async function build(){
    cancelAnimationFrame(raf);
    lane.innerHTML = '';
    bubbles.length = 0;
    nextIdx = 0;

    if (document.fonts && document.fonts.ready){ try { await document.fonts.ready; } catch(e){} }

    const laneW = lane.clientWidth;
    let x = 0;

    // Initial fill
    while (x < laneW + PAD){
      const b = make(LABELS[nextIdx++ % LABELS.length]);
      b.x = x;
      b.el.style.transform = `translateX(${b.x}px)`;
      b.el.style.opacity = b.x < FADE ? (b.x/FADE).toFixed(3) : 1;
      bubbles.push(b);
      x += b.w + GAP;
    }

    lastT = 0;
    raf = requestAnimationFrame(tick);
  }

  function tick(ts){
    raf = requestAnimationFrame(tick);
    if (!running){ lastT = ts; return; }

    if (!lastT) lastT = ts;
    const dt = Math.min(0.05, (ts - lastT) / 1000);
    lastT = ts;

    const laneW = lane.clientWidth;

    for (const b of bubbles){
      b.x -= SPEED * dt;
      b.el.style.transform = `translateX(${b.x}px)`;

      // Fade in/out near edges
      let a = 1;
      if (b.x < 0) a = Math.max(0, Math.min(1, (b.x + FADE)/FADE));
      else if (b.x > laneW - FADE) a = Math.max(0, Math.min(1, 1 - ((b.x - (laneW - FADE))/FADE)));
      b.el.style.opacity = a.toFixed(3);
    }

    // Rightmost for append
    let rightMost = -Infinity;
    for (const b of bubbles) rightMost = Math.max(rightMost, b.x + b.w);

    // Recycle
    for (const b of bubbles){
      if (b.x + b.w < -PAD){
        const label = LABELS[nextIdx++ % LABELS.length];
        b.el.textContent = label;
        b.w = Math.ceil(b.el.getBoundingClientRect().width) + 6;
        b.x = rightMost + GAP;
        b.el.style.transform = `translateX(${b.x}px)`;
        b.el.style.opacity = 0;
        rightMost = b.x + b.w;
      }
    }
  }

  toggleBtn.addEventListener('click', ()=>{ running = !running; setButton(); });
  addEventListener('resize', ()=>{ build(); });
  setButton(); build();
})();

/* footer year */
const y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();
