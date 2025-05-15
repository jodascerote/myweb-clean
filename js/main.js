/*  js/main.js  — full file  */

/* ---------------------------------------------
   0.  Vanta background
----------------------------------------------*/
if (window.VANTA && VANTA.NET) {
  VANTA.NET({
    el: '#vanta-bg',
    backgroundColor: 0x0b172a,
    color: 0x39a0ed,
    points: 30,
    maxDistance: 20,
    spacing: 20,
    showDots: true,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    scale: 1.0,
    scaleMobile: 1.0
  });
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------
     1.  Floating code symbols (unchanged)
  ----------------------------------------------*/
  const codeBg = document.querySelector('.code-bg');
  const chars  = ['{','}','<','>','/',';','(',')','[',']','=','+','*','&','%','#'];
  for (let i = 0; i < 50; i++) {
    const span = document.createElement('span');
    span.className  = 'code-char';
    span.textContent = chars[Math.floor(Math.random() * chars.length)];
    span.style.left  = `${Math.random() * 100}vw`;
    span.style.animationDuration = `${6 + Math.random() * 6}s`;
    span.style.fontSize = `${20 + Math.random() * 30}px`;
    span.style.color = Math.random() < 0.5
      ? 'var(--color-accent1)'
      : 'var(--color-accent2)';
    codeBg.appendChild(span);
  }

  /* ---------------------------------------------
     2.  Name intro (unchanged)
  ----------------------------------------------*/
  const nameEl = document.getElementById('name');
  nameEl.innerHTML = nameEl.textContent.trim()
    .replace(/\S/g, "<span class='letter'>$&</span>");

  anime.timeline().add({
    targets: '#name .letter',
    translateY: [150, 0],
    opacity:    [0, 1],
    rotateX:    [90, 0],
    scale:      [0.3, 1],
    easing: 'easeOutExpo',
    duration: 700,
    delay: (el, i) => 40 * i
  });

  /* ---------------------------------------------
     3.  Floating circle triggers
        –--- responsive coordinates  –---
  ----------------------------------------------*/

  /** true when viewport ≤ 500 px wide */
  const isMobile = () => window.innerWidth <= 500;

  /** choose circle coordinates based on screen size */
  const baseConfigs = [
    { key:'about',      label:'About Me',       xPct:15, yPct:30, color:'var(--color-accent1)' },
    { key:'history',    label:'Work History',   xPct:85, yPct:30, color:'var(--color-accent2)' },
    { key:'automation', label:'Workflow Eng.',  xPct:50, yPct:75, color:'var(--color-primary)'}
  ];
  const mobileConfigs = [
    { key:'about',      label:'About Me',       xPct:20, yPct:25, color:'var(--color-accent1)' },
    { key:'history',    label:'Work History',   xPct:80, yPct:25, color:'var(--color-accent2)' },
    { key:'automation', label:'Workflow Eng.',  xPct:50, yPct:80, color:'var(--color-primary)'}
  ];

  const hero = document.getElementById('vanta-bg');
  let triggers = [];   // keep references so we can remove on resize

  function createTriggers() {
    const cfgs = isMobile() ? mobileConfigs : baseConfigs;

    cfgs.forEach(cfg => {
      const el = document.createElement('div');
      el.className = 'trigger';
      el.dataset.popup = cfg.key;
      el.textContent   = cfg.label;
      el.style.background = cfg.color;
      hero.appendChild(el);
      triggers.push(el);

      // place & animate
      const startX = (cfg.xPct / 100) * window.innerWidth;
      const startY = (cfg.yPct / 100) * window.innerHeight;
      gsap.set(el, { x: startX, y: startY });
      gsap.to(el, {
        x: startX + (Math.random() * 40 - 20),
        y: startY + (Math.random() * 30 - 15),
        duration: 4 + Math.random() * 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2
      });
    });
  }
  createTriggers();   // initial draw

  /*  --- handle phone rotation / resize (debounced) --- */
  let resizeTO = null;
  function handleResize() {
    if (resizeTO) clearTimeout(resizeTO);
    resizeTO = setTimeout(() => {
      // remove old triggers
      triggers.forEach(t => t.remove());
      triggers = [];
      createTriggers();
    }, 200);
  }
  window.addEventListener('resize', handleResize);

  /* ---------------------------------------------
     4.  Pop-up logic (unchanged)
  ----------------------------------------------*/
  const popupModal  = document.getElementById('popupModal');
  const popupInner  = document.getElementById('popupInner');
  const popupClose  = document.getElementById('popupClose');
  const popupData = {
    about: `
      <h3>About Me</h3>
      <p>I lead with imagination and let code keep pace. A relentlessly driven animator and award-winning filmmaker, I’ve scripted 30+ custom After Effects tools, built 2 extensions, and coded 6 Python apps that clear the runway for fresh ideas to take flight…</p>
    `,
    history: `
      <h3>Work History</h3>
      <ul>
        <li>2016–2025 · Senior Motion Graphics & Automation Lead – AdMed</li>
        <li>2003–Present · Freelance Creative Director</li>
        <li>2003–2008 · Owner, Bradford Sound Studios</li>
      </ul>
    `,
    automation: `
      <h3>Workflow Engineering</h3>
      <p>I design the machinery behind the magic. 30+ AE scripts, two production-ready extensions, six Python apps…</p>
    `
  };
  document.addEventListener('click', e => {
    if (e.target.matches('.trigger')) {
      popupInner.innerHTML = popupData[e.target.dataset.popup] || '';
      popupModal.classList.add('open');
    }
  });
  popupClose.addEventListener('click', () => popupModal.classList.remove('open'));
  popupModal.addEventListener('click', e => {
    if (e.target === popupModal) popupClose.click();
  });

  /* ---------------------------------------------
     5.  Reel thumbnail modal (unchanged)
  ----------------------------------------------*/
  const modal      = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  const closeBtn   = document.getElementById('closeModal');
  document.querySelectorAll('.video-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      modalVideo.src = thumb.dataset.src;
      modal.classList.add('open');
    });
  });
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    modalVideo.pause();
    modalVideo.currentTime = 0;
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) closeBtn.click();
  });
});
