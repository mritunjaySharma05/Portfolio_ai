/* ── HERO CANVAS PARTICLES ─────────────────────────────── */
(() => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    spawn();
  }

  function spawn() {
    const count = Math.min(Math.max(Math.floor((W * H) / 13000), 45), 130);
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 1.4 + 0.4,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,245,255,0.48)';
      ctx.fill();
    });
    /* connections */
    for (let a = 0; a < pts.length; a++) {
      for (let b = a + 1; b < pts.length; b++) {
        const d = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y);
        if (d < 115) {
          ctx.strokeStyle = `rgba(0,245,255,${0.11 * (1 - d / 115)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(pts[a].x, pts[a].y);
          ctx.lineTo(pts[b].x, pts[b].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ── HERO NAME LETTER-BY-LETTER REVEAL ─────────────────── */
(() => {
  const nameSpan = document.getElementById('hero-name-span');
  if (!nameSpan) return;
  const text = nameSpan.textContent;
  nameSpan.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.textContent      = ch === ' ' ? ' ' : ch;
    s.style.animationDelay = `${0.35 + i * 0.038}s`;
    nameSpan.appendChild(s);
  });
})();

/* ── TYPING CAROUSEL ────────────────────────────────────── */
(() => {
  const el    = document.getElementById('typing-el');
  if (!el) return;
  const roles = ['AI/ML Engineer', 'Deep Learning Researcher', 'RAG Systems Builder', 'Future Founder'];
  let ri = 0, ci = 0, del = false;

  function tick() {
    const word = roles[ri];
    if (!del) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { del = true; return setTimeout(tick, 2000); }
      setTimeout(tick, 78);
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { del = false; ri = (ri + 1) % roles.length; return setTimeout(tick, 380); }
      setTimeout(tick, 44);
    }
  }
  tick();
})();
