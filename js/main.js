// js/main.js

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
    duration: 700,
    delay: (el, i) => 40 * i
  });

  // 4. Set up floating triggers via GSAP tweens
  const hero = document.getElementById('vanta-bg');
  const triggerConfigs = [
    { key: 'about',     label: 'About Me',     xPct: 15, yPct: 30, color: 'var(--color-accent1)' },
    { key: 'history',   label: 'Work History', xPct: 85, yPct: 30, color: 'var(--color-accent2)' },
    { key: 'automation',label: 'Automation',   xPct: 50, yPct: 75, color: 'var(--color-primary)' }
  ];

  triggerConfigs.forEach(cfg => {
    // create element
    const el = document.createElement('div');
    el.className = 'trigger';
    el.dataset.popup = cfg.key;
    el.innerText = cfg.label;
    el.style.background = cfg.color;
    hero.appendChild(el);

    // compute initial pixel positions
    const startX = (cfg.xPct / 100) * window.innerWidth;
    const startY = (cfg.yPct / 100) * window.innerHeight;

    // place the circle via transform
    gsap.set(el, { x: startX, y: startY });

    // gentle floating tween: ±20px in X, ±15px in Y
    gsap.to(el, {
      x: startX + (Math.random() * 40 - 20),
      y: startY + (Math.random() * 30 - 15),
      duration: 4 + Math.random() * 2,        // 4–6 seconds
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 2
    });
  });

  // 5. Popup logic (with new “automation” key)
  const popupModal = document.getElementById('popupModal');
  const popupInner = document.getElementById('popupInner');
  const popupClose = document.getElementById('popupClose');
  const popupData = {
    about: `
      <h3>About Me</h3>
      <p>Hi, I'm Gerson Bradford—a motion graphics designer and AE scripting enthusiast. I build tools and animations that bring ideas to life.</p>
    `,
    history: `
      <h3>Work History</h3>
      <ul>
        <li>2020–2025: Senior Motion Designer @ Creative Studio</li>
        <li>2017–2020: AE Scripting Lead @ Video Labs</li>
        <li>2014–2017: Freelance Animator & Developer</li>
      </ul>
    `,
    automation: `
      <h3>Automation</h3>
      <p>I automate After Effects workflows, build AE extensions, and create Adobe Creative Cloud apps using Python and JS to streamline production.</p>
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
