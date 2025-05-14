// 1. Initialize Vanta.NET immediately
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
  // 2. Floating code symbols (unchanged)
  const codeBg = document.querySelector('.code-bg');
  const chars = ['{','}','<','>','/',';','(',')','[',']','=','+','*','&','%','#'];
  for (let i = 0; i < 50; i++) {
    const span = document.createElement('span');
    span.className = 'code-char';
    span.textContent = chars[Math.floor(Math.random() * chars.length)];
    span.style.left = `${Math.random() * 100}vw`;
    span.style.animationDuration = `${6 + Math.random() * 6}s`;
    span.style.fontSize = `${20 + Math.random() * 30}px`;
    span.style.color = Math.random() < 0.5
      ? 'var(--color-accent1)'
      : 'var(--color-accent2)';
    codeBg.appendChild(span);
  }

  // 3. Anime.js letter intro (unchanged)
  const nameEl = document.getElementById('name');
  const text = nameEl.textContent.trim();
  nameEl.innerHTML = text.replace(/\S/g, "<span class='letter'>$&</span>");
  anime.timeline().add({
    targets: '#name .letter',
    translateY: [150, 0],
    opacity: [0, 1],
    rotateX: [90, 0],
    scale: [0.3, 1],
    easing: 'easeOutExpo',
    duration: 500,            // made a bit faster
    delay: (el, i) => 30 * i  // reduced delay
  });

  // 4. Floating triggers via GSAP tweens
  const hero = document.getElementById('vanta-bg');
  const triggerConfigs = [
    { key: 'about',      label: 'About Me',             xPct: 15, yPct: 30, color: 'var(--color-accent1)' },
    { key: 'history',    label: 'Work History',         xPct: 85, yPct: 30, color: 'var(--color-accent2)' },
    { key: 'automation', label: 'Workflow Engineering', xPct: 50, yPct: 75, color: 'var(--color-primary)' }
  ];

  triggerConfigs.forEach(cfg => {
    const el = document.createElement('div');
    el.className = 'trigger';
    el.dataset.popup = cfg.key;
    el.innerText = cfg.label;
    el.style.background = cfg.color;
    hero.appendChild(el);

    const startX = (cfg.xPct / 100) * window.innerWidth;
    const startY = (cfg.yPct / 100) * window.innerHeight;
    gsap.set(el, { x: startX, y: startY });

    gsap.to(el, {
      x: startX + (Math.random() * 40 - 20),
      y: startY + (Math.random() * 30 - 15),
      duration: 2 + Math.random() * 2,  // faster floating
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 1
    });
  });

  // 5. Popup logic and new content
  const popupModal = document.getElementById('popupModal');
  const popupInner = document.getElementById('popupInner');
  const popupClose = document.getElementById('popupClose');
  const popupData = {
    about: `
      <h3>About Me</h3>
      <p>I lead with imagination and let code keep pace. A relentlessly driven animator and award-winning filmmaker, I’ve scripted 30+ custom After Effects tools, built 2 extensions, and coded 6 Python apps that clear the runway for fresh ideas to take flight. Automation and AI handle the grind; I focus on color, rhythm, and story—then push each frame past tomorrow’s trends. Every deadline is my starting line, every project version 1.0 of something bolder. As I level up into full-stack AI, I’m ready to stretch storytelling wherever the future points next.</p>
    `,
    history: `
      <h3>Work History</h3>
      <ul>
        <li>2016 – 2025 · Senior Motion Graphics &amp; Automation Lead, AdMed  
            Delivered complex medical e-learning and built 34 AE scripts, 2 extensions, 4 Python apps that cut turnaround time by 50%.</li>
        <li>2003 – Present · Freelance Creative Director  
            Directed broadcast spots driving eight-figure sales; provide end-to-end production and custom tool development for agencies worldwide.</li>
        <li>2003 – 2008 · Owner, Bradford Sound Studios  
            Engineered 200+ albums and scores, overseeing recording to final master.</li>
      </ul>
    `,
    automation: `
      <h3>Workflow Engineering</h3>
      <p>I design the machinery behind the magic. Over 30 custom After Effects scripts, two production-ready extensions, and six Python apps keep editors in flow while the pipeline handles the grunt work. From JSX that sequences 600 layers in seconds to AI-powered asset tagging, every tool I ship buys creatives more time to create.</p>
    `
  };

  document.querySelectorAll('.trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.popup;
      popupInner.innerHTML = popupData[key] || '<p>No info found.</p>';
      popupModal.classList.add('open');
    });
  });
  popupClose.addEventListener('click', () => popupModal.classList.remove('open'));
  popupModal.addEventListener('click', e => {
    if (e.target === popupModal) popupClose.click();
  });

  // 6. Reel thumbnail modal (unchanged)
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
