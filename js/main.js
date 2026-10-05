/* ============================================================
   EVEN GROUND · Main JavaScript
   Scroll reveals, nav behavior, counters, mobile menu
   ============================================================ */

(function () {
  'use strict';

  // Mark JS as active so CSS can hide-then-reveal the bento tiles. With JS
  // off these rules don't apply and the photos show normally (fail-safe).
  document.documentElement.classList.add('js');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll Reveal (Intersection Observer) ---------------
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (prefersReducedMotion) {
      reveals.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px -8% 0px' }  /* fire near the edge so
         nothing is already half-read before it deigns to appear (motion spec) */
    );

    reveals.forEach(el => observer.observe(el));
  }

  // --- Nav scroll behavior ---------------------------------
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;

    // Over a navy surface the floating navy sheet merged with it (Franc,
    // 2026-10-04, the Focus sheet). Flag nav--on-navy while the nav's foot
    // lies across a navy sheet, so the sheet can change its own
    // surface there. Bounds, not hit testing: pinned sheets and photograph
    // layers ignore pointer events, so elementsFromPoint misses or misreads
    // them.
    // Navy sheets only: over the navy-dark footer the plain navy sheet already
    // stands apart, and the deeper state would match the floor.
    const navyGrounds = [].slice.call(document.querySelectorAll('.sheet--navy, .stories-chapter--turn .section-header, .page-home #subscribe'));
    function onNavy() {
      if (!nav.classList.contains('scrolled')) return false;
      const r = nav.getBoundingClientRect();
      const y = r.bottom + 2;
      const xs = [r.left + r.width * 0.25, r.left + r.width / 2, r.left + r.width * 0.75];
      return navyGrounds.some((g) => {
        const b = g.getBoundingClientRect();
        if (y < b.top || y > b.bottom) return false;
        return xs.filter((x) => x >= b.left && x <= b.right).length >= 2;
      });
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 60);
          nav.classList.toggle('nav--on-navy', onNavy());
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // (Removed: initAnchorOffset / --anchor-offset measurement. Anchor landings
  //  are never offset by a measured nav height; only a section's own CSS
  //  scroll-margin-top moves them. See initSmoothScroll for the rationale.)

  // --- Mobile menu -----------------------------------------
  function initMobileMenu() {
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileNav = document.querySelector('.nav__mobile');
    if (!hamburger || !mobileNav) return;

    let savedScrollY = 0;

    // The menu as one state machine (Codex R2-1/2/3). Three rules:
    // 1. The nav is PROMOTED above the overlay while open (CSS .nav.nav-open),
    //    because .nav's own stacking context at z-100 sits under the z-101
    //    overlay: without promotion the X is unreachable by pointer and
    //    invisible when focused. That defect predates the containment work.
    // 2. Only elements THIS menu inerted get restored, from the recorded list,
    //    so a future dialog's own inert state cannot be wiped by closing this.
    // 3. Every close path restores focus to the hamburger; Escape adds nothing.
    var inerted = [];

    function openMenu() {
      hamburger.classList.add('open');
      mobileNav.classList.add('open');
      mobileNav.removeAttribute('inert');
      mobileNav.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      document.querySelector('.nav').classList.add('nav-open');
      inerted = [];
      Array.prototype.forEach.call(document.body.children, function (el) {
        if (el === mobileNav || el.contains(mobileNav) || el.contains(hamburger)) return;
        if (!el.hasAttribute('inert')) { el.setAttribute('inert', ''); inerted.push(el); }
      });
      // inside the promoted nav, everything except the hamburger goes inert
      Array.prototype.forEach.call(document.querySelectorAll('.nav a, .nav button'), function (c) {
        if (c !== hamburger && !c.hasAttribute('inert')) { c.setAttribute('inert', ''); inerted.push(c); }
      });
      var first = mobileNav.querySelector('a, button');
      if (first) first.focus();
      // iOS-compatible scroll lock: position:fixed preserves scroll position
      // and prevents background scroll-through that overflow:hidden alone misses.
      savedScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('inert', '');
      mobileNav.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      document.querySelector('.nav').classList.remove('nav-open');
      inerted.forEach(function (el) { el.removeAttribute('inert'); });
      inerted = [];
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollY);
      // every close path lands focus back on the toggle; without this a
      // same-page link click left focus stranded inside the inert overlay
      hamburger.focus();
    }

    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', 'mobile-nav');
    mobileNav.id = mobileNav.id || 'mobile-nav';

    hamburger.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // --- Counter animation -----------------------------------
  function initCounters() {
    const counters = document.querySelectorAll('.counter[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';

            if (prefersReducedMotion) {
              setCounterText(el, target, prefix, suffix);
            } else {
              animateCounter(el, target, prefix, suffix);
            }

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach(el => observer.observe(el));
  }

  // Render a counter value with thousands separators and the suffix wrapped
  // in a gold-accented span (e.g. the "+" on 200,000+).
  function setCounterText(el, value, prefix, suffix) {
    el.innerHTML = prefix + value.toLocaleString() +
      (suffix ? '<span class="num-suffix">' + suffix + '</span>' : '');
  }

  function animateCounter(el, target, prefix, suffix) {
    const duration = 900;   /* spec wanted the count-up gone; kept as the site's
                               signature impact moment, but no reader waits 2s */
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      setCounterText(el, current, prefix, suffix);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCounterText(el, target, prefix, suffix);
      }
    }

    requestAnimationFrame(step);
  }

  // --- Smooth scroll for anchor links ----------------------
  // Lands the target where the browser's own hash jump would: its top at the
  // top of the viewport, less the target's CSS scroll-margin-top.
  //
  // There is still no nav measurement here. The hero background is fixed
  // behind the whole page, so an offset is only safe where the strip above
  // the target is opaque, and CSS is the one place that knows that. Every
  // sibling section computes scroll-margin-top: 0 and lands exactly as it
  // always has (its own ground covers the fixed hero, the floating nav sits
  // over its top padding). The homepage's table sections (#focus, #story,
  // #partners, #team) set a margin that puts their first object just under
  // the nav bar; the strip above them is cream-dark table, never the hero.
  // The margin goes negative on wide screens, which lands the target a few
  // pixels past its own top; that is the same table, so it is safe too.
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (hash === '#') return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.pageYOffset;
        y -= parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        moveFocusTo(target);
      });
    });
  }

  // preventDefault above also cancels the browser's own focus move, so the
  // skip link and the in-page nav links only scrolled: focus stayed put and
  // the next Tab went back into the nav (WCAG 2.4.1). Send focus to the
  // target as the native jump would. A target that cannot take focus gets
  // tabindex -1 for as long as it holds focus; preventScroll leaves the
  // smooth scroll in charge, and data-anchor-focus drops the ring, because
  // the target is a whole section, not a control.
  function moveFocusTo(target) {
    if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.setAttribute('data-anchor-focus', '');
      target.addEventListener('blur', function onBlur() {
        target.removeAttribute('tabindex');
        target.removeAttribute('data-anchor-focus');
        target.removeEventListener('blur', onBlur);
      });
    }
    target.focus({ preventScroll: true });
  }

  // --- Active nav link -------------------------------------
  function initActiveNav() {
    const sections = Array.prototype.slice.call(
      document.querySelectorAll('section[id]')
    );
    if (!sections.length) return;

    const navLinks = document.querySelectorAll(
      '.nav__links a[href*="#"], .nav__dropdown-link[href*="#"]'
    );

    function linkPointsTo(link, id) {
      const href = link.getAttribute('href') || '';
      return href === '#' + id || href.endsWith('#' + id);
    }

    function setActive(id) {
      navLinks.forEach(link => {
        if (linkPointsTo(link, id)) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    // Scroll-position based active detection, more reliable than
    // IntersectionObserver when multiple sections overlap the intersection
    // band (which was causing Focus to show Impact as active). The active
    // section is simply the one whose top has most recently scrolled past
    // the nav line.
    const navOffset = 120;  // pill height + buffer
    let lastActiveId = null;

    function updateActive() {
      let activeId = null;
      for (var i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top - navOffset <= 0) {
          activeId = sections[i].id;     // last section whose top has passed the line
        } else {
          break;                          // sections are in document order; once one is below, stop
        }
      }
      if (activeId && activeId !== lastActiveId) {
        setActive(activeId);
        lastActiveId = activeId;
      } else if (!activeId && lastActiveId) {
        // Scrolled above the first section → no nav highlight
        navLinks.forEach(l => l.removeAttribute('aria-current'));
        lastActiveId = null;
      }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    updateActive();
  }

  // --- Parallax on heroes ----------------------------------
  /* initParallax removed 2026-08-20: its call site was deleted when the hero
     transform conflict was resolved, leaving 54 unreachable lines. History is
     in git (54e96f4 era) if it is ever wanted back. */

  // --- Carousel photos: fetch before they are needed -------
  // The partner photos are loading="lazy", and a lazy image inside the
  // carousel's scroller only starts to load once it slides into the
  // scroller's own view. So a neighbour's photo began loading as it moved in,
  // and a card could arrive with an empty photo for a second. When the
  // section is within about two screens, every card's photo is switched to
  // eager. The three sets share six URLs, so that is six fetches, and the
  // clones then paint from the cache. Pages without the carousel skip this.
  function initPartnerPhotos() {
    var wrap = document.querySelector('.partner-carousel-wrap');
    if (!wrap) return;
    var imgs = wrap.querySelectorAll('img[loading="lazy"]');
    if (!imgs.length) return;
    function eager() {
      imgs.forEach(function (img) { img.loading = 'eager'; });
    }
    if (!('IntersectionObserver' in window)) { eager(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      eager();
    }, { rootMargin: '1600px 0px' });
    io.observe(wrap);
  }

  // --- Carousel: square tiles that open in the centre -----
  // Franc, 2026-10-04: the native scroller flipped the centre card's open and
  // closed states mid-scroll, so photographs jumped while the row moved. Now
  // the row is one track that glides by transform. Off-centre cards are square
  // photograph tiles; the centre card opens to photograph plus panel as it
  // lands (its words fade out first and in last). One move takes about 0.65s
  // and a new command mid-move simply retargets. The markup keeps three
  // identical sets [A clones][B primary][C clones] for an endless loop: after
  // a move settles in A or C, the track jumps silently to the twin in B.
  // With JS off the grid stays the old snap-scroller and every card is whole.
  function initCarouselDots() {
    var grid = document.querySelector('.partner-grid');
    var dotsContainer = document.getElementById('partnerDots');
    if (!grid || !dotsContainer) return;
    var cards = grid.querySelectorAll('.partner-card');
    if (cards.length < 3 || cards.length % 3 !== 0) return;
    var N = cards.length / 3;
    var prevBtn = document.querySelector('.carousel-arrow--prev');
    var nextBtn = document.querySelector('.carousel-arrow--next');

    var track = document.createElement('div');
    track.className = 'partner-track';
    while (grid.firstChild) track.appendChild(grid.firstChild);
    grid.appendChild(track);
    grid.classList.add('is-track');

    var active = N;           // index into cards; starts on the first card of set B
    var tileW = 0, openW = 0, gap = 0, padL = 0;
    var settleTimer = null;
    var MOVE_MS = 550;

    function measure() {
      track.classList.add('no-anim');
      cards.forEach(function (c, k) { c.classList.toggle('is-active', k === active); });
      cards.forEach(function (c, k) { c.classList.toggle('is-ahead', k > active); });
      var probe = cards[active === 0 ? cards.length - 1 : 0];   // a closed tile
      if (active === 0) probe.classList.remove('is-ahead');
      var wasActive = cards[active];
      // Layout sizes, not painted boxes: the arrival animation scales the
      // cards while they are hidden, which would skew every offset.
      tileW = parseFloat(getComputedStyle(probe).width);
      openW = parseFloat(getComputedStyle(wasActive).width);
      gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      padL = parseFloat(getComputedStyle(grid).paddingLeft) || 0;
      // Phones stack the card, so open and closed share one width; the open
      // card grows in height. Hold the row at the tallest open card so the
      // page below never moves as partners change.
      if (Math.abs(openW - tileW) < 1) {
        var tallest = 0;
        cards.forEach(function (c) {
          c.classList.add('is-active');
          tallest = Math.max(tallest, c.offsetHeight);
          if (c !== wasActive) c.classList.remove('is-active');
        });
        track.style.minHeight = tallest + 'px';
      } else {
        track.style.minHeight = '';
      }
    }

    function offsetFor(i) {
      // The track starts inside the grid's left padding; centre the open card
      // in the grid's visible width.
      var centre = i * (tileW + gap) + openW / 2;
      return grid.clientWidth / 2 - padL - centre;
    }

    function updateDots() {
      var partnerIdx = ((active - N) % N + N) % N;
      dots.forEach(function (d, k) {
        d.classList.toggle('active', k === partnerIdx);
        if (k === partnerIdx) { d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); }
      });
    }

    function render(instant) {
      if (instant) track.classList.add('no-anim');
      cards.forEach(function (c, k) {
        c.classList.toggle('is-active', k === active);
        c.classList.toggle('is-ahead', k > active);
      });
      track.style.transform = 'translate3d(' + offsetFor(active) + 'px, 0, 0)';
      updateDots();
      if (instant) {
        void track.offsetHeight;
        requestAnimationFrame(function () { track.classList.remove('no-anim'); });
      }
    }

    // Franc, 2026-10-04: cards ahead of the centre (to the right) are already
    // whole, so the next card simply slides in with its name showing; a card
    // condenses to a photograph tile only as it passes to the left. One move,
    // one glide: no opening step.
    function goTo(i) {
      clearTimeout(settleTimer);
      active = Math.max(0, Math.min(cards.length - 1, i));
      render(prefersReducedMotion);
      settleTimer = setTimeout(settle, prefersReducedMotion ? 0 : MOVE_MS + 40);
    }

    // Once a move has landed in a clone set, swap to the identical card in B.
    function settle() {
      if (active < N) { active += N; render(true); }
      else if (active >= 2 * N) { active -= N; render(true); }
    }

    function step(dir) { goTo(active + dir); }

    var dots = [];
    for (var i = 0; i < N; i++) (function (i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      var nameEl = cards[i + N].querySelector('.partner-card__name');
      dot.setAttribute('aria-label', 'Go to ' + (nameEl ? nameEl.textContent.trim() : 'partner ' + (i + 1)));
      dot.addEventListener('click', function () {
        // Go the short way round from wherever the row currently is.
        var cur = ((active - N) % N + N) % N;
        var d = i - cur;
        if (d > N / 2) d -= N;
        if (d < -N / 2) d += N;
        goTo(active + d);
      });
      dotsContainer.appendChild(dot);
      dots.push(dot);
    })(i);

    if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });

    grid.setAttribute('tabindex', '0');
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', 'Partner carousel');
    grid.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
    });

    // A side tile comes to the centre when clicked; the open card's link goes
    // to the partner's page. Keyboard focus on a card's link centres it too.
    cards.forEach(function (c, k) {
      var link = c.querySelector('.partner-card__link');
      c.addEventListener('click', function (e) {
        if (dragged) { e.preventDefault(); return; }
        if (k !== active) { e.preventDefault(); goTo(k); return; }
        // The open card is one target: a click on its photograph or panel
        // follows the partner link (the link itself handles its own clicks).
        if (link && !e.target.closest('a')) { window.location.href = link.href; }
      });
      if (link) link.addEventListener('focus', function () { if (k !== active) goTo(k); });
    });
    // The track's transform is the only thing that places cards. Where the
    // CSS clip is unsupported the grid is still a scroll container, and
    // focusing an off-centre link would scroll it on top of the transform.
    grid.addEventListener('scroll', function () {
      if (grid.scrollLeft) grid.scrollLeft = 0;
    }, { passive: true });

    // Swipe and drag: the row follows the pointer, then commits to one step.
    var startX = 0, dx = 0, down = false, dragged = false;
    grid.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      down = true; dragged = false; startX = e.clientX; dx = 0;
    });
    grid.addEventListener('pointermove', function (e) {
      if (!down) return;
      dx = e.clientX - startX;
      if (!dragged && Math.abs(dx) > 8) {
        dragged = true;
        track.classList.add('no-anim');
        // Hold the gesture once it is a real drag, so leaving a card or the
        // grid mid-swipe cannot end it. Taken only now, so a plain click
        // still reaches the card's link.
        try { grid.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (dragged) track.style.transform = 'translate3d(' + (offsetFor(active) + dx * 0.9) + 'px, 0, 0)';
    });
    function release() {
      if (!down) return;
      down = false;
      if (!dragged) return;
      track.classList.remove('no-anim');
      if (dx < -50) step(1); else if (dx > 50) step(-1); else render(false);
      setTimeout(function () { dragged = false; }, 0);
    }
    grid.addEventListener('pointerup', release);
    grid.addEventListener('pointercancel', release);

    measure();
    render(true);
    window.addEventListener('resize', function () { measure(); render(true); }, { passive: true });

    // The page's scroll reveal only fires for cards it sees on screen, so cards
    // that slide in from the side would arrive faded and then pop in. Reveal
    // all of them together, the moment the carousel itself comes into view.
    function revealAll() { cards.forEach(function (c) { c.classList.add('visible'); }); }
    if ('IntersectionObserver' in window) {
      var revealIo = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        revealIo.disconnect();
        revealAll();
      }, { threshold: 0.15 });
      revealIo.observe(grid);
    } else { revealAll(); }

    /* Footer roster and any old shared index.html?partner=N links still land
       on the right card: data-partner is the partner's index within one set. */
    document.querySelectorAll('[data-partner]').forEach(function (el) {
      el.addEventListener('click', function () {
        var n = parseInt(el.getAttribute('data-partner'), 10);
        if (isNaN(n) || n < 0 || n >= N) return;
        setTimeout(function () { goTo(n + N); }, 400);
      });
    });
    var wanted = parseInt((location.search.match(/[?&]partner=(\d+)/) || [])[1], 10);
    if (!isNaN(wanted) && wanted >= 0 && wanted < N) {
      setTimeout(function () { goTo(wanted + N); }, 600);
    }
  }

  // --- Nav dropdown (Partners) -----------------------------
  function initNavDropdown() {
    var dropdown = document.querySelector('.nav__dropdown');
    if (!dropdown) return;
    var trigger = dropdown.querySelector('.nav__dropdown-trigger');
    var panel = dropdown.querySelector('.nav__dropdown-panel');
    if (!trigger || !panel) return;

    var items = panel.querySelectorAll('a');

    function open() {
      dropdown.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      dropdown.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      dropdown.classList.contains('is-open') ? close() : open();
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });

    /* Clicking the Partners label (sibling to the chevron trigger) should
       navigate to #partners AND close the dropdown if it's open. */
    var link = dropdown.querySelector('.nav__dropdown-link');
    if (link) link.addEventListener('click', close);

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) close();
    });

    // Close on Escape; return focus to trigger
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
        close();
        trigger.focus();
      }
    });

    // Arrow-key navigation within the panel
    panel.addEventListener('keydown', function (e) {
      var idx = Array.prototype.indexOf.call(items, document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(idx + 1) % items.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault(); items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault(); items[items.length - 1].focus();
      }
    });

    // Selecting an item closes the panel (browser will navigate after)
    items.forEach(function (a) {
      a.addEventListener('click', close);
    });
  }


  // --- Focus: impact areas as a photograph and a step story -------
  // Franc, 2026-10-04: the old swap was three timed phases with a lock and
  // a queue, and the seams read as a stutter. Now one change drives it all:
  // the selected panel and print get .is-on and CSS does the rest (the print
  // crossfades, the old steps fade while the new rise in order, the gold line
  // draws and its dots fill). Nothing waits on a timer, so a fast second
  // click simply retargets the transitions. The underline travels to the
  // selected tab. Arrow keys, Home and End move between tabs (APG tabs).
  function initFocusTabs() {
    var tabs = [].slice.call(document.querySelectorAll('[data-areas-tab]'));
    var panels = [].slice.call(document.querySelectorAll('[data-areas-panel]'));
    var prints = [].slice.call(document.querySelectorAll('[data-areas-print]'));
    var ink = document.querySelector('.areas__ink');
    if (!tabs.length || !panels.length) return;

    function moveInk(t) {
      if (!ink || !t) return;
      var pad = parseFloat(getComputedStyle(t).paddingLeft) || 12;
      ink.style.setProperty('--x', (t.offsetLeft + pad) + 'px');
      ink.style.setProperty('--w', (t.offsetWidth - 2 * pad) + 'px');
      ink.style.setProperty('--y', (t.offsetTop + t.offsetHeight - 9) + 'px');
      // The segmented control's sliding pill: the selected tab's whole box.
      ink.style.setProperty('--px', t.offsetLeft + 'px');
      ink.style.setProperty('--pw', t.offsetWidth + 'px');
      ink.style.setProperty('--py', t.offsetTop + 'px');
      ink.style.setProperty('--ph', t.offsetHeight + 'px');
    }

    function select(i, focus) {
      tabs.forEach(function (t, k) {
        t.setAttribute('aria-selected', k === i ? 'true' : 'false');
        t.tabIndex = k === i ? 0 : -1;
      });
      panels.forEach(function (p, k) {
        var on = k === i;
        p.classList.toggle('is-on', on);
        p.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) { p.removeAttribute('inert'); } else { p.setAttribute('inert', ''); }
      });
      prints.forEach(function (p, k) {
        p.classList.toggle('is-on', k === i);
        if (k === i) { p.removeAttribute('aria-hidden'); } else { p.setAttribute('aria-hidden', 'true'); }
      });
      moveInk(tabs[i]);
      if (focus) tabs[i].focus();
    }

    function current() {
      for (var k = 0; k < tabs.length; k++) if (tabs[k].getAttribute('aria-selected') === 'true') return k;
      return 0;
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, c = current();
        if (e.key === 'ArrowRight') { e.preventDefault(); select((c + 1) % n, true); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); select((c + n - 1) % n, true); }
        else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        else if (e.key === 'End') { e.preventDefault(); select(n - 1, true); }
      });
    });

    // The photographs load as the section nears, so the first switch never
    // shows an empty print.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        io.disconnect();
        // Phones hide the prints (CSS); don't fetch what isn't shown.
        if (prints[0] && getComputedStyle(prints[0].parentNode).display === 'none') return;
        prints.forEach(function (p) { var img = p.querySelector('img'); if (img) img.loading = 'eager'; });
      }, { rootMargin: '800px 0px' });
      io.observe(tabs[0]);
    }

    function place() { moveInk(tabs[current()]); }
    window.addEventListener('resize', place, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    requestAnimationFrame(place);
  }

  // Block link/image dragging globally. CSS handles WebKit/Chromium
  // via -webkit-user-drag; this is the Firefox fallback.
  document.addEventListener('dragstart', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'A' || t.tagName === 'IMG' || (t.closest && t.closest('a')))) {
      e.preventDefault();
    }
  });

  // --- Init ------------------------------------------------
  function init() {
    initNav();
    initMobileMenu();
    initNavDropdown();
    initReveal();
    initCurtain();        // early, so a later init throw can't leave galleries hidden
    initCounters();
    initSmoothScroll();
    initActiveNav();
    // initParallax() removed: scroll-driven scale/opacity on the hero
    // caused a "growing" effect on slide 1 (no other slides got the
    // transform) and contributed to mobile scroll jitter as iOS Safari's
    // address bar collapsed. The slideshow is now truly static: photos
    // crossfade on a timer, content scrolls over them via the fixed bg.
    initCarouselDots();
    initPartnerPhotos();
    initFocusTabs();
    initHeroSlideshow();
    initStoryParallax();
    initProjectHeroParallax();
    initVideoLightbox();
    initStoryPosters();
  }

  // --- Story video lightbox --------------------------------
  // A story card can carry a film. The button opens it in a dialog ON the page
  // rather than sending anyone to YouTube, which is the whole point: the board
  // rule is that nothing visitor-facing leaves evenground.org.
  //
  // The iframe src is set on open and stripped on close. That means no YouTube
  // request, and no cookie, until a visitor actually asks for the video, and
  // closing genuinely stops playback rather than hiding a still-running player.
  // Stories: the portrait print and the navy film sheet open the story's
  // film by forwarding to its own button, so the button stays the one
  // accessible control and the lightbox returns focus to it on close.
  function initStoryPosters() {
    document.querySelectorAll('.page-stories .story-editorial').forEach(function (story) {
      var btn = story.querySelector('.story-video[data-video]');
      if (!btn) return;
      story.classList.add('has-film');
      // Franc, 2026-10-04: the film sheet is the one way in; the portrait
      // carries no play disc and no longer opens the film.
      [story.querySelector('.story-editorial__pathway h4')].forEach(function (el) {
        if (el) el.addEventListener('click', function () { btn.click(); });
      });
    });
  }

  function initVideoLightbox() {
    var triggers = document.querySelectorAll('[data-video]');
    if (!triggers.length) return;

    var box = document.createElement('div');
    box.className = 'video-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Video');
    box.setAttribute('tabindex', '-1');
    box.hidden = true;
    box.innerHTML =
      '<div class="video-lightbox__backdrop" data-close></div>' +
      '<span class="video-lightbox__sentinel" tabindex="0" aria-hidden="true"></span>' +
      '<div class="video-lightbox__panel">' +
        '<button type="button" class="video-lightbox__close" data-close aria-label="Close video">' +
          '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
          'stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
          '<line x1="6" y1="6" x2="18" y2="18"></line>' +
          '<line x1="18" y1="6" x2="6" y2="18"></line></svg>' +
        '</button>' +
        '<div class="video-lightbox__frame"><iframe title="" allow="accelerometer; ' +
        'autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>' +
      '</div>' +
      '<span class="video-lightbox__sentinel" tabindex="0" aria-hidden="true"></span>';
    document.body.appendChild(box);

    var frame = box.querySelector('iframe');
    var closeBtn = box.querySelector('.video-lightbox__close');
    var sentinels = box.querySelectorAll('.video-lightbox__sentinel');
    var lastFocus = null;

    /* Focus containment. The player iframe is cross-origin, so once focus is
       inside it the parent document sees no key events at all; a keydown trap
       therefore CANNOT manage Tab here, and the old one locked keyboard users
       out of the player entirely by bouncing every Tab to the close button.
       Sentinels bracket the panel instead: tabbing off either end of the
       dialog lands on one, which hands focus to the opposite end. Tab order
       inside is close button <-> player, both reachable. */
    sentinels[0].addEventListener('focus', function () { frame.focus(); });
    sentinels[1].addEventListener('focus', function () { closeBtn.focus(); });

    function open(id, label, trigger) {
      // Remember the button itself rather than document.activeElement, which is
      // the body if the dialog was opened any way other than a real mouse click.
      lastFocus = trigger || document.activeElement;
      frame.setAttribute('title', label || 'Video');
      // Two providers now. A bare id is YouTube, anything starting http is used
      // as given, which is how Streamable and anything else gets in without the
      // lightbox needing to know about them.
      if (/^https?:/i.test(id)) {
        frame.src = id + (id.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1';
        box.hidden = false;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function () {
          box.classList.add('is-open');
          box.focus();
        });
        return;
      }

      // Strip the player back to the video and the standard controls.
      //   rel=0            related videos at the end stay on Even Ground's channel
      //   iv_load_policy=3 no annotation cards over the picture
      //   color=white      plain progress bar instead of the red one
      //   modestbranding=1 deprecated by YouTube in 2024, harmless, honoured by
      //                    some older clients so it costs nothing to send
      // What cannot be removed: the title strip that appears on hover, and the
      // YouTube wordmark bottom-right. Only a self-hosted file would drop those.
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
                  '?rel=0&autoplay=1&playsinline=1&iv_load_policy=3&color=white&modestbranding=1';
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () {
        box.classList.add('is-open');
        // Focus the dialog, not the close button. Focusing the button leaves a
        // ring sitting on the gold disc for mouse users; focusing the dialog
        // still moves the screen reader and the Tab sequence into it.
        box.focus();
      });
    }

    function close() {
      box.classList.remove('is-open');
      frame.removeAttribute('src');          // stops playback outright
      box.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        open(btn.getAttribute('data-video'), btn.getAttribute('data-video-title'), btn);
      });
    });

    box.addEventListener('click', function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute('data-close')) close();
      if (e.target.closest && e.target.closest('[data-close]')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      /* Escape only fires while focus is in the parent document; once the user
         is inside the player, the provider's own Escape handling applies. */
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
  }

  // --- Bento photo emerge ----------------------------------
  // When a gallery scrolls into view, reveal ALL its tiles at once; the CSS
  // per-tile transition-delay then plays a slow, graceful staggered cascade.
  // Revealing as a group (rather than per-tile on its own intersection) keeps
  // the stagger deliberate and ordered instead of dependent on scroll speed.
  // Tiles start hidden via CSS (.js gate); reduced-motion leaves them shown.
  function initCurtain() {
    if (prefersReducedMotion) return;
    var galleries = document.querySelectorAll('.bento-gallery');
    if (!galleries.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var items = e.target.querySelectorAll('.bento-gallery__item');
        for (var i = 0; i < items.length; i++) items[i].classList.add('is-emerging');
        io.unobserve(e.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
    galleries.forEach(function (g) { io.observe(g); });
  }

  // --- Our Story cinematic parallax ------------------------
  // Drifts the "Two Decades of Partnership" photo vertically as its section
  // travels through the viewport, for a cinematic sense of depth. Deliberately
  // transform-only (scale + translateY), rAF-throttled, and only listening
  // to scroll while the section is on screen (IntersectionObserver). This is
  // NOT the background-attachment / unthrottled scroll approach that caused
  // the old mobile jitter. Disabled entirely under prefers-reduced-motion,
  // leaving a clean static image. The resting scale keeps the photo larger
  // than its frame so the drift never exposes an edge.
  function initStoryParallax() {
    if (prefersReducedMotion) return;
    var photo = document.querySelector('.story-hero__photo');
    var img = photo && photo.querySelector('img');
    if (!img) return;

    /* THE EDGE ARITHMETIC, which an earlier version got wrong and Franc caught
       as a white line tearing open above the photograph as he scrolled past.

       A scale of S leaves (S - 1) / 2 of the image's height hanging off EACH
       edge of its box. The drift moves the image by DRIFT of its height. So the
       overhang has to beat the drift, or the box's own background shows through:

           (SCALE_MIN - 1) / 2  >  DRIFT

       It was 1.01 and 0.012, which gives 0.5% of overhang against 1.2% of
       travel. The image pulled away from the top of its box by 0.7% of its
       height, and what showed through was the cream section behind it.

       Now 1.04 against 0.012: 2% of overhang against 1.2% of travel, so the
       edge stays covered with room to spare. Any future change to one of these
       three numbers has to be checked against that inequality. */
    var SCALE_MIN = 1.04;
    var SCALE_MAX = 1.075;
    var DRIFT = 0.012;
    var active = false, ticking = false;

    function render() {
      ticking = false;
      var rect = photo.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      /* progress: +1 when the section sits fully below the fold, 0 at centre,
         -1 once it has travelled above: a smooth pass-through value. */
      var center = rect.top + rect.height / 2;
      var p = (center - vh / 2) / (vh / 2 + rect.height / 2);
      p = Math.max(-1, Math.min(1, p));
      /* t rises 0 -> 1 as you scroll the section up through the viewport, so
         the photo pushes in (zooms) the whole way: the dominant, cinematic
         move. The drift is a small supporting parallax. The live scale keeps
         the image larger than its frame, so the drift never exposes an edge. */
      var t = (1 - p) / 2;
      var scale = (SCALE_MIN + (SCALE_MAX - SCALE_MIN) * t).toFixed(3);
      var ty = (p * DRIFT * 100).toFixed(2);   /* % of the img's own height */
      img.style.transform = 'scale(' + scale + ') translateY(' + ty + '%)';
    }
    function onScroll() {
      if (active && !ticking) { ticking = true; requestAnimationFrame(render); }
    }

    img.style.willChange = 'transform';
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        active = e.isIntersecting;
        if (active) render();
      });
    }, { threshold: 0 }).observe(photo);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    render();
  }

  // --- Partner-page hero scroll parallax -------------------
  // Scroll-linked push-in on the single hero photo. It zooms as you scroll
  // down past it, the same treatment as the Our Story portrait (a time-based
  // loop makes no sense for one still). Top-anchored mapping: scale 1 at rest,
  // growing toward 1.16 as the hero scrolls away. Desktop only: a scroll-
  // linked transform at the very top of the page is exactly what jittered on
  // iOS as the address bar collapsed, so mobile stays static (and it matches
  // the home hero's gating). transform-only + rAF; scale >=1 so object-fit:
  // cover never exposes an edge.
  function initProjectHeroParallax() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia('(min-width: 768px)').matches) return;
    var photo = document.querySelector('.project-hero__photo');
    var img = photo && photo.querySelector('img');
    if (!img) return;

    var MAX = 0.16;            /* extra scale at full scroll-through */
    var ticking = false;
    function render() {
      ticking = false;
      var rect = photo.getBoundingClientRect();
      var h = rect.height || 1;
      /* 0 at rest (hero pinned at top) -> 1 once fully scrolled past */
      var prog = Math.min(1, Math.max(0, -rect.top / h));
      img.style.transform = 'scale(' + (1 + MAX * prog).toFixed(4) + ')';
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(render); }
    }

    img.style.willChange = 'transform';
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    render();
  }


  // --- Hero slideshow --------------------------------------
  // Crossfade between the hero photographs every ~5 seconds. Each slide
  // displays for ~3s then takes 2s to fade into the next. Pauses on tab
  // hide (visibilitychange) so the timer doesn't drift in background tabs.
  // Respects prefers-reduced-motion (stays on slide 1).
  //
  // Where the page carries a .hero__pause button (the homepage), the visitor
  // can stop it (WCAG 2.2.2): the crossfade timer is cleared and the Ken Burns
  // push-in freezes where it is. It stays paused until they press it again;
  // nothing resumes it on its own. Pages without the button rotate as before.
  function initHeroSlideshow() {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll('.hero__slideshow .hero__slide')
    );
    if (slides.length < 2 || prefersReducedMotion) return;

    var DWELL_MS = 3000;       /* time slide is fully visible */
    var FADE_MS = 2000;        /* crossfade duration */
    var TICK_MS = DWELL_MS + FADE_MS;
    var i = 0;
    var tabHidden = false;     /* the tab is in the background */
    var userPaused = false;    /* the visitor pressed pause */
    var timer = 0;             /* the pending dwell timeout */
    var run = 0;               /* bumped by every start and stop: a loop that
                                  wakes up to a newer run is stale and ends */
    var scrolledAway = false;  /* homepage: the reader has scrolled off the top */
    function stopped() { return tabHidden || userPaused || scrolledAway; }

    /* Ken Burns push-in, driven from the slideshow so it stays in lock-step
       with the slides. Each slide zooms over TICK_MS + FADE_MS (slightly
       longer than its time on screen), so it's still gently moving as it
       crossfades out (no freeze, no snap), while the incoming slide starts
       fresh from scale 1. Desktop + motion-allowed only; otherwise static. */
    var kenBurns = !prefersReducedMotion &&
      window.matchMedia('(min-width: 768px)').matches;
    /* Intentionally far longer than a slide's time on screen (~7s): the
       push-in never completes before the crossfade, so it reads as a slow,
       gentle drift rather than a race to full zoom. Lower = faster. */
    var ZOOM_MS = 16000;
    function zoom(slide) {
      if (!kenBurns || !slide) return;
      slide.style.animation = 'none';
      void slide.offsetWidth;              /* reflow so the animation restarts cleanly */
      slide.style.animation = 'hero-kenburns ' + ZOOM_MS + 'ms linear forwards';
      if (userPaused || scrolledAway) slide.style.animationPlayState = 'paused';
    }

    /* loadSlide(n): promote data-src → src if not already loading, and
       resolve a Promise once the image has finished decoding. If the slide
       errors out we resolve anyway so the rotation never wedges. */
    function loadSlide(n) {
      var s = slides[n];
      if (!s) return Promise.resolve();
      if (!s.src && s.dataset && s.dataset.src) {
        /* srcset first, so the browser can pick the small candidate before a
           bare src fetch of the full-width file starts. */
        if (s.dataset.srcset) { s.srcset = s.dataset.srcset; delete s.dataset.srcset; }
        s.src = s.dataset.src;
        delete s.dataset.src;
      }
      if (s.complete && s.naturalWidth > 0) return Promise.resolve();
      return new Promise(function (resolve) {
        var done = function () {
          s.removeEventListener('load', done);
          s.removeEventListener('error', done);
          resolve();
        };
        s.addEventListener('load', done);
        s.addEventListener('error', done);
      });
    }

    /* The loop: wait dwell + fade time AND wait for the next slide to
       finish loading; only then swap. If next isn't loaded yet, the user
       sees the current slide a bit longer rather than a blank frame. */
    function tick() {
      if (stopped()) return;
      var mine = ++run;
      var next = (i + 1) % slides.length;
      clearTimeout(timer);
      var dwell = new Promise(function (r) { timer = setTimeout(r, TICK_MS); });
      Promise.all([dwell, loadSlide(next)]).then(function () {
        if (mine !== run || stopped()) return;
        /* Mark the outgoing slide for the length of its fade so the scoped
           will-change (active + leaving only) covers both sides of the
           crossfade instead of promoting all eleven slides permanently. */
        (function (leaving) {
          leaving.classList.add('is-leaving');
          setTimeout(function () { leaving.classList.remove('is-leaving'); }, FADE_MS + 100);
        })(slides[i]);
        slides[i].classList.remove('is-active');
        slides[next].classList.add('is-active');
        zoom(slides[next]);            /* restart the push-in for the new slide */
        i = next;
        /* Greedy preload of N+1 so it's cached well before its turn. */
        loadSlide((i + 1) % slides.length);
        tick();
      });
    }

    /* Pause when tab is hidden so we don't crossfade in the background.
       Coming back restarts the loop unless the visitor paused it; the run
       counter retires any loop that was still waiting, so a quick hide and
       show can never leave two loops running. */
    document.addEventListener('visibilitychange', function () {
      tabHidden = document.hidden;
      if (tabHidden) { clearTimeout(timer); run++; }
      else tick();
    });

    /* The visitor's pause. Pressed means paused. */
    var control = document.querySelector('.hero__pause');
    function setPaused(on) {
      userPaused = on;
      control.setAttribute('aria-pressed', on ? 'true' : 'false');
      slides.forEach(function (s) { s.style.animationPlayState = (on || scrolledAway) ? 'paused' : 'running'; });
      if (on) { clearTimeout(timer); run++; }
      else tick();
    }
    if (control) {
      control.addEventListener('click', function () { setPaused(!userPaused); });
    }

    /* Homepage only: the hero is pinned and the collage's paper slides over
       it, so the picture under the cut has to be the one the reader was
       looking at. The moment they leave the top, the rotation and the Ken
       Burns push-in freeze on the current slide; back at the top they carry
       on (unless the visitor paused). A crossfade already under way finishes
       on its own CSS transition. Siblings keep rotating as before. */
    if (document.body.classList.contains('page-home')) {
      var freezeQueued = false;
      var checkScroll = function () {
        freezeQueued = false;
        var away = (window.scrollY || window.pageYOffset) > 0;
        if (away === scrolledAway) return;
        scrolledAway = away;
        slides.forEach(function (s) {
          s.style.animationPlayState = (away || userPaused) ? 'paused' : 'running';
        });
        if (away) { clearTimeout(timer); run++; }
        else tick();
      };
      window.addEventListener('scroll', function () {
        if (freezeQueued) return;
        freezeQueued = true;
        requestAnimationFrame(checkScroll);
      }, { passive: true });
      checkScroll();
    }

    /* Wait for slide 1 to actually be ready, then start the rotation
       (also pre-warm slide 2 immediately so it streams in parallel). The
       pause control appears only now, when something is actually moving. */
    loadSlide(0).then(function () {
      loadSlide(1);
      zoom(slides[0]);              /* start the push-in on the first slide too */
      if (control) control.hidden = false;
      tick();
    });
  }

  /* Newsletter logic removed 2026-08-20: the feature was dropped site-wide by
     board decision and no page carries [data-newsletter]. */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
