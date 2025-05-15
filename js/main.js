// js/main.js  (full file)

/* ------------------------------------------------------------------ */
/* 1.  Vanta background                                               */
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
    scale: 1.0,
    scaleMobile: 1.0,
  });
}

/* ------------------------------------------------------------------ */
/* 2.  Floating code symbols (unchanged)                              */
/* ------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  const codeBg = document.querySelector(".code-bg");
  const chars = ["{", "}", "<", ">", "/", ";", "(", ")", "[", "]", "=", "+", "*", "&", "%", "#"];
  for (let i = 0; i < 50; i++) {
    const span = document.createElement("span");
    span.className = "code-char";
    span.textContent = chars[Math.floor(Math.random() * chars.length)];
    span.style.left = `${Math.random() * 100}vw`;
    span.style.animationDuration = `${6 + Math.random() * 6}s`;
    span.style.fontSize = `${20 + Math.random() * 30}px`;
    span.style.color = Math.random() < 0.5 ? "var(--color-accent1)" : "var(--color-accent2)";
    codeBg.appendChild(span);
  }

  /* ---------------------------------------------------------------- */
  /* 3.  Anime.js letter intro (unchanged)                            */
  /* ---------------------------------------------------------------- */
  const nameEl = document.getElementById("name");
  const text = nameEl.textContent.trim();
  nameEl.innerHTML = text.replace(/\S/g, "<span class='letter'>$&</span>");
  anime
    .timeline()
    .add({
      targets: "#name .letter",
      translateY: [150, 0],
      opacity: [0, 1],
      rotateX: [90, 0],
      scale: [0.3, 1],
      easing: "easeOutExpo",
      duration: 700,
      delay: (el, i) => 40 * i,
    });

  /* ---------------------------------------------------------------- */
  /* 4.  Create the three floating triggers                           */
  /* ---------------------------------------------------------------- */
  const hero = document.getElementById("vanta-bg");
  const triggerConfigs = [
    { key: "about", label: "About Me", xPct: 15, yPct: 30, color: "var(--color-accent1)" },
    { key: "history", label: "Work History", xPct: 85, yPct: 30, color: "var(--color-accent2)" },
    { key: "automation", label: "Workflow Eng.", xPct: 50, yPct: 75, color: "var(--color-primary)" },
  ];

  const activeTweens = new Map(); // keep a reference so we can pause / play later

  triggerConfigs.forEach((cfg) => {
    const el = document.createElement("div");
    el.className = "trigger";
    el.dataset.popup = cfg.key;
    el.innerText = cfg.label;
    el.style.background = cfg.color;
    hero.appendChild(el);

    const startX = (cfg.xPct / 100) * window.innerWidth;
    const startY = (cfg.yPct / 100) * window.innerHeight;

    gsap.set(el, { x: startX, y: startY });

    const tween = gsap.to(el, {
      x: startX + (Math.random() * 40 - 20),
      y: startY + (Math.random() * 30 - 15),
      duration: 4 + Math.random() * 2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 2,
    });
    activeTweens.set(el, tween);
  });

  /* ---------------------------------------------------------------- */
  /* 5.  Popup logic (unchanged)                                      */
  /* ---------------------------------------------------------------- */
  const popupModal = document.getElementById("popupModal");
  const popupInner = document.getElementById("popupInner");
  const popupClose = document.getElementById("popupClose");
  const popupData = {
    about: `
      <h3>About Me</h3>
      <p>I lead with imagination and let code keep pace. …</p>
    `,
    history: `
      <h3>Work History</h3>
      <ul>
        <li>2016-2025 · Senior Motion Graphics & Automation Lead – AdMed</li>
        <li>2003-Present · Freelance Creative Director</li>
        <li>2003-2008 · Owner – Bradford Sound Studios</li>
      </ul>
    `,
    automation: `
      <h3>Workflow Engineering</h3>
      <p>I design the machinery behind the magic. …</p>
    `,
  };

  document.querySelectorAll(".trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.popup;
      popupInner.innerHTML = popupData[key] || "<p>(no content)</p>";
      popupModal.classList.add("open");
    });
  });
  popupClose.addEventListener("click", () => popupModal.classList.remove("open"));
  popupModal.addEventListener("click", (e) => {
    if (e.target === popupModal) popupClose.click();
  });

  /* ---------------------------------------------------------------- */
  /* 6.  Reel thumbnail modal (unchanged)                             */
  /* ---------------------------------------------------------------- */
  const modal = document.getElementById("videoModal");
  const modalVideo = document.getElementById("modalVideo");
  const closeBtn = document.getElementById("closeModal");
  document.querySelectorAll(".video-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      modalVideo.src = thumb.dataset.src;
      modal.classList.add("open");
    });
  });
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("open");
      modalVideo.pause();
      modalVideo.currentTime = 0;
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeBtn.click();
    });
  }

  /* ---------------------------------------------------------------- */
  /* 7.  OPTIONAL  —  make circles draggable on touch devices         */
  /* ---------------------------------------------------------------- */
  function isTouchDevice() {
    return matchMedia("(pointer: coarse)").matches;
  }

  if (isTouchDevice()) {
    document.querySelectorAll(".trigger").forEach((circle) => {
      circle.style.touchAction = "none"; // allow free panning

      circle.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "touch") return;

        const tween = activeTweens.get(circle);
        if (tween) tween.pause();

        const startX = e.clientX;
        const startY = e.clientY;
        const orig = circle.getBoundingClientRect();
        const offsetX = startX - orig.left;
        const offsetY = startY - orig.top;

        function onMove(ev) {
          const x = ev.clientX - offsetX;
          const y = ev.clientY - offsetY;
          gsap.set(circle, { x, y });
          ev.preventDefault();
        }
        function onUp() {
          if (tween) tween.play();
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        }

        window.addEventListener("pointermove", onMove, { passive: false });
        window.addEventListener("pointerup", onUp);
      });
    });
  }
});
