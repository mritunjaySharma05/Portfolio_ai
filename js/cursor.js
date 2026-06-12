(() => {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0, raf;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function lerp() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(lerp);
  })();

  /* hover states */
  const TARGETS = 'a,button,input,select,textarea,.tab-btn,.project-card,.blog-card,.social-btn,.glass-card';

  function attach() {
    document.querySelectorAll(TARGETS).forEach(el => {
      el.addEventListener('mouseenter', () => { ring.classList.add('hover'); dot.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { ring.classList.remove('hover'); dot.classList.remove('hover'); });
    });
  }
  attach();

  /* magnetic button effect */
  function attachMagnetic() {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r   = btn.getBoundingClientRect();
        const x   = e.clientX - r.left - r.width  / 2;
        const y   = e.clientY - r.top  - r.height / 2;
        const glowRgb = btn.dataset.glow === 'violet' ? '124,58,237' : '0,245,255';
        btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
        btn.style.boxShadow = `0 8px 28px rgba(${glowRgb},0.38)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.boxShadow = '';
      });
    });
  }
  attachMagnetic();
})();
