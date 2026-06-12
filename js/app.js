document.addEventListener('DOMContentLoaded', () => {

  /* ── SCROLL PROGRESS ──────────────────────────────────── */
  const bar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (scrollY / max * 100) + '%';
  }, { passive: true });


  /* ── NAVBAR SCROLL GLASS ──────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', scrollY > 72);
  }, { passive: true });


  /* ── HAMBURGER MENU ───────────────────────────────────── */
  const ham   = document.getElementById('hamburger');
  const menu  = document.getElementById('mobile-menu');

  ham.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    ham.classList.toggle('active', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      ham.classList.remove('active');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });


  /* ── VIDEO PLACEHOLDER ────────────────────────────────── */
  const vid  = document.getElementById('intro-video');
  const ph   = document.getElementById('video-placeholder');
  if (vid && ph) {
    vid.addEventListener('error', () => {
      vid.style.display = 'none';
      ph.style.display  = 'flex';
    });
    /* If no src loads after 800ms, show placeholder */
    setTimeout(() => {
      if (vid.readyState === 0) {
        vid.style.display = 'none';
        ph.style.display  = 'flex';
      }
    }, 800);
  }


  /* ── INTERSECTION OBSERVER — REVEAL ANIMATIONS ─────────── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('active');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObs.observe(el);
  });


  /* ── STATS COUNTER ────────────────────────────────────── */
  let counted = false;
  const statsGrid = document.getElementById('stats-grid');
  const statsObs  = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      document.querySelectorAll('.stat-number').forEach(el => {
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || '';
        const dur    = 1400;
        const start  = performance.now();
        function update(now) {
          const p   = Math.min((now - start) / dur, 1);
          const val = Math.floor(p * (2 - p) * target);
          el.textContent = val + (p < 1 ? '' : suffix);
          if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      });
    }
  }, { threshold: 0.5 });
  if (statsGrid) statsObs.observe(statsGrid);


  /* ── PROJECT FILTER TABS ──────────────────────────────── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        const show = f === 'all' || card.dataset.category === f;
        if (show) {
          card.style.display = 'flex';
          requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = ''; });
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'scale(0.94) translateY(8px)';
          setTimeout(() => { card.style.display = 'none'; }, 280);
        }
      });
    });
  });


  /* ── TIMELINE SCROLL DRAW ─────────────────────────────── */
  const fill      = document.getElementById('tl-fill');
  const tlOuter   = document.querySelector('.timeline-outer');
  const tlItems   = document.querySelectorAll('.tl-item');

  const tlItemObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
  }, { threshold: 0.3 });
  tlItems.forEach(i => tlItemObs.observe(i));

  if (fill && tlOuter) {
    window.addEventListener('scroll', () => {
      const rect   = tlOuter.getBoundingClientRect();
      const prog   = Math.max(0, Math.min(1, (innerHeight / 2 - rect.top) / rect.height));
      fill.style.height = (prog * 100) + '%';
    }, { passive: true });
  }


  /* ── PROJECT SHARE BUTTONS ───────────────────────────── */
  const shareToast = document.getElementById('share-toast');
  let toastTimer;
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = btn.dataset.id;
      const url = `${location.origin}${location.pathname}#${id}`;
      navigator.clipboard.writeText(url).then(() => {
        clearTimeout(toastTimer);
        shareToast.classList.add('show');
        toastTimer = setTimeout(() => shareToast.classList.remove('show'), 2200);
      });
    });
  });

  /* ── CONTACT FORM ─────────────────────────────────────── */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn  = form.querySelector('[type="submit"]');
      const orig = btn.innerHTML;
      btn.disabled  = true;
      btn.innerHTML = 'Sending...';
      try {
        const res = await fetch('https://formspree.io/f/mpqedyaz', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if (res.ok) {
          btn.innerHTML        = 'Message Sent ✓';
          btn.style.background = '#10B981';
          setTimeout(() => {
            form.reset();
            btn.disabled         = false;
            btn.innerHTML        = orig;
            btn.style.background = '';
          }, 2600);
        } else {
          btn.innerHTML        = 'Failed — try again';
          btn.style.background = '#EF4444';
          setTimeout(() => {
            btn.disabled         = false;
            btn.innerHTML        = orig;
            btn.style.background = '';
          }, 2600);
        }
      } catch {
        btn.innerHTML        = 'Failed — try again';
        btn.style.background = '#EF4444';
        setTimeout(() => {
          btn.disabled         = false;
          btn.innerHTML        = orig;
          btn.style.background = '';
        }, 2600);
      }
    });
  }

});
