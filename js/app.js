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


  /* ── HASHNODE BLOG FEED ───────────────────────────────── */
  const blogGrid     = document.getElementById('blog-grid');
  const blogFallback = document.getElementById('blog-fallback');
  const blogViewAll  = document.getElementById('blog-view-all');

  if (blogGrid) {
    const MAX_POSTS = 3;

    const truncate = (text, max) => {
      if (text.length <= max) return text;
      const cut = text.slice(0, max);
      return cut.slice(0, cut.lastIndexOf(' ')) + '…';
    };

    // Same-origin Netlify Function (netlify/functions/blog-feed.js) reads
    // from Netlify Blobs, populated by blog-webhook.js whenever Hashnode
    // notifies us of a new/updated post. We don't fetch Hashnode directly
    // — its Cloudflare protection blocks all automated requests to the
    // blog (curl, serverless fetches, RSS→JSON proxies, all of it), so
    // pushing data to us on publish is the only thing that works.
    fetch('/.netlify/functions/blog-feed')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(({ posts }) => {
        if (!posts || !posts.length) return;

        posts.slice(0, MAX_POSTS).forEach(post => {
          const card = document.createElement('article');
          card.className = 'glass-card blog-card';

          const date = document.createElement('span');
          date.className = 'blog-card-date';
          const d = new Date(post.publishedAt || '');
          date.textContent = isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          const title = document.createElement('h3');
          title.className = 'blog-card-title';
          title.textContent = post.title || '';

          const excerpt = document.createElement('p');
          excerpt.className = 'blog-card-excerpt';
          const raw = (post.excerpt || '').replace(/<[^>]*>/g, '').trim();
          excerpt.textContent = truncate(raw, 140);

          const link = document.createElement('a');
          link.className = 'blog-card-link';
          link.href   = post.url || '#';
          link.target = '_blank';
          link.rel    = 'noopener';
          link.innerHTML = 'Read Article <svg class="icon"><use href="#i-arrow-right"/></svg>';

          card.append(date, title, excerpt, link);
          blogGrid.appendChild(card);
        });

        blogGrid.hidden = false;
        if (blogFallback) blogFallback.hidden = true;
        if (blogViewAll)  blogViewAll.hidden  = false;
      })
      .catch(() => { /* function unreachable (e.g. local file preview) or no posts stored yet — fallback card stays visible */ });
  }

});
