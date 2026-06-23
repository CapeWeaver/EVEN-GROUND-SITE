/* ============================================================
   EVEN GROUND — Main JavaScript
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach(el => observer.observe(el));
  }

  // --- Nav scroll behavior ---------------------------------
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // (Removed: initAnchorOffset / --anchor-offset measurement. Anchor landings
  //  no longer offset by nav height — sections land at the top of the viewport.
  //  See initSmoothScroll for the rationale.)

  // --- Mobile menu -----------------------------------------
  function initMobileMenu() {
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileNav = document.querySelector('.nav__mobile');
    if (!hamburger || !mobileNav) return;

    let savedScrollY = 0;

    function openMenu() {
      hamburger.classList.add('open');
      mobileNav.classList.add('open');
      mobileNav.removeAttribute('inert');
      mobileNav.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
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
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, savedScrollY);
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
        hamburger.focus();
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
    const duration = 2000;
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
  // Lands every in-page section with its TOP at the top of the viewport.
  //
  // Why no nav-height offset: the hero background is position:fixed, so it's
  // pinned behind the whole page forever. Any positive scroll offset leaves
  // a gap above the target that the fixed hero shows through — the recurring
  // "sliver of the previous section under the nav". Every section we link to
  // is full-viewport-height with vertically-centred content and generous top
  // padding, so landing the section top at y=0 means: the section's own
  // opaque background covers the fixed hero completely (zero sliver), and the
  // floating nav sits over the section's top padding with the heading well
  // clear beneath it. No nav measurement, nothing to drift, nothing to break.
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (hash === '#') return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'smooth' });
      });
    });
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

    // Scroll-position based active detection — more reliable than
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
  function initParallax() {
    if (prefersReducedMotion) return;

    var pageHero = document.querySelector('.page-hero');
    var mainHero = document.querySelector('.hero');
    var ticking = false;

    if (!pageHero && !mainHero) return;

    // Cache DOM queries and dimensions
    var pageHeroContent = pageHero ? pageHero.querySelector('.container') : null;
    var bgImg = mainHero ? mainHero.querySelector('.hero__bg img') : null;
    var heroContent = mainHero ? mainHero.querySelector('.hero__content') : null;
    var cachedPageHeroHeight = pageHero ? pageHero.offsetHeight : 0;
    var cachedMainHeroHeight = mainHero ? mainHero.offsetHeight : 0;

    window.addEventListener('resize', function() {
      if (pageHero) cachedPageHeroHeight = pageHero.offsetHeight;
      if (mainHero) cachedMainHeroHeight = mainHero.offsetHeight;
    }, { passive: true });

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.scrollY;

          // Page hero (sub-pages) — content parallax + fade
          if (pageHero) {
            if (scrollY < cachedPageHeroHeight && pageHeroContent) {
              var progress = scrollY / cachedPageHeroHeight;
              pageHeroContent.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
              pageHeroContent.style.opacity = 1 - progress * 1.2;
            }
          }

          // Main hero — image zooms out, content fades up
          if (mainHero) {
            if (scrollY < cachedMainHeroHeight) {
              var p = scrollY / cachedMainHeroHeight;
              // Image: zoom from 1.25 → 1.05, no vertical drift
              var scale = Math.max(1.05, 1.25 - (p * 0.2));
              if (bgImg) bgImg.style.transform = 'scale(' + scale + ')';
              // Content: fade and drift down (stays anchored longer)
              if (heroContent) {
                heroContent.style.opacity = Math.max(0, 1 - p * 2);
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // --- Carousel: arrows, dots, center-focus dimming --------
  function initCarouselDots() {
    var grid = document.querySelector('.partner-grid');
    var dotsContainer = document.getElementById('partnerDots');
    if (!grid || !dotsContainer) return;

    // The HTML contains 3 identical sets of partner cards in sequence:
    //   [Set A — left-wrap clones]   [Set B — primary]   [Set C — right-wrap clones]
    // No JS cloning at runtime — everything is parsed by the browser on first paint
    // (so image preload + cache work as expected).
    var cards = grid.querySelectorAll('.partner-card');
    if (cards.length < 3 || cards.length % 3 !== 0) return;
    var N = cards.length / 3;                         // partners per set

    var prevBtn = document.querySelector('.carousel-arrow--prev');
    var nextBtn = document.querySelector('.carousel-arrow--next');

    // One dot per partner (driven by the primary set — set B)
    for (var i = 0; i < N; i++) (function (i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to partner ' + (i + 1));
      dot.addEventListener('click', function () { scrollToCard(i + N, true); });
      dotsContainer.appendChild(dot);
    })(i);
    var dots = dotsContainer.querySelectorAll('button');

    // Horizontal distance between equivalent cards in adjacent sets
    function setWidth() {
      return cards[N].offsetLeft - cards[0].offsetLeft;
    }

    function scrollToCard(i, smooth) {
      var card = cards[i];
      if (!card) return;
      var target = card.offsetLeft - (grid.clientWidth / 2) + (card.offsetWidth / 2);
      grid.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
    }

    function activeIndex() {
      var gridCentre = grid.scrollLeft + (grid.clientWidth / 2);
      var bestIdx = 0;
      var bestDist = Infinity;
      for (var k = 0; k < cards.length; k++) {
        var c = cards[k];
        var cCentre = c.offsetLeft + (c.offsetWidth / 2);
        var d = Math.abs(cCentre - gridCentre);
        if (d < bestDist) { bestDist = d; bestIdx = k; }
      }
      return bestIdx;
    }

    function applyActive() {
      var idx = activeIndex();
      var partnerIdx = ((idx - N) % N + N) % N;       // which partner (0..N-1)
      cards.forEach(function (c, k) {
        c.classList.toggle('is-active', k === idx);
      });
      dots.forEach(function (d, k) {
        d.classList.toggle('active', k === partnerIdx);
      });
      // Arrows always live — no boundaries in an infinite carousel.
    }

    // After scroll settles, if the centred card is in Set A (clones) or Set C
    // (clones), silently jump to the equivalent card in Set B. The 3 sets
    // render identical content so the jump is visually invisible — BUT only
    // if we (a) move the .is-active class to the equivalent card BEFORE the
    // scroll jump (so the centred screen position never loses its "active"
    // card), and (b) disable card transitions during the jump frame so the
    // overlay opacity doesn't animate a visible cross-fade.
    function maybeWrap() {
      var idx = activeIndex();
      var newIdx;
      if (idx < N) {
        newIdx = idx + N;
        wrapTo(idx, newIdx, +1);
      } else if (idx >= 2 * N) {
        newIdx = idx - N;
        wrapTo(idx, newIdx, -1);
      }
    }

    function wrapTo(oldIdx, newIdx, direction) {
      grid.classList.add('is-wrapping');           // kill transitions for one frame
      cards[oldIdx].classList.remove('is-active'); // transfer active state atomically
      cards[newIdx].classList.add('is-active');
      grid.scrollLeft += direction * setWidth();   // silent scroll jump
      // Force a reflow so the browser commits the scroll + class changes
      // before we re-enable transitions on the next frame.
      void grid.offsetHeight;
      requestAnimationFrame(function () {
        grid.classList.remove('is-wrapping');
      });
    }

    function step(direction) {
      scrollToCard(activeIndex() + direction, true);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });

    grid.setAttribute('tabindex', '0');
    grid.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
    });

    var ticking = false;
    var wrapTimer;
    grid.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          applyActive();
          ticking = false;
        });
        ticking = true;
      }
      clearTimeout(wrapTimer);
      // Wait long enough for the smooth-scroll animation to complete (~500ms)
      // before considering a silent wrap. Wrapping mid-animation breaks the
      // visual continuity the smooth scroll was creating.
      wrapTimer = setTimeout(maybeWrap, 250);
    }, { passive: true });

    // Initial position — centre the first card of Set B, the primary set.
    // Since cards are already in the DOM at parse time (no JS cloning),
    // their offsetLeft values are immediately valid.
    requestAnimationFrame(function () {
      scrollToCard(N, false);
      applyActive();
    });
    window.addEventListener('resize', applyActive, { passive: true });
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

  // --- Impact rings reveal --------------------------------
  // The ring SVGs are pre-rendered with stroke-dashoffset = full circumference
  // (empty). When the .impact-rings container enters view we add .is-in-view
  // and the CSS animates the dashoffset to 0 — drawing each ring to full.
  function initImpactRings() {
    var rings = document.querySelector('.impact-rings');
    if (!rings) return;
    if (prefersReducedMotion) {
      rings.classList.add('is-in-view');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          rings.classList.add('is-in-view');
          io.unobserve(rings);
        }
      });
    }, { threshold: 0.3 });
    io.observe(rings);
  }

  // --- Focus tabs ------------------------------------------
  // Tab strip swaps which impact-area panel is visible (Education /
  // Health / Youth). Panels share a grid cell so the container always sizes
  // to the tallest panel — no section-height jump between tabs.
  //
  // Transition sequence (premium feel, no glitchy crossfade):
  // 1. Outgoing panel gets `.is-leaving` → fades + slides DOWN over ~0.5s.
  // 2. After ~0.4s overlap, incoming panel gets `.is-entering` (positioned
  //    above, invisible). Then on the next paint we swap to `.is-active`,
  //    which transitions FROM the entering frame INTO place → slides DOWN
  //    from above as it fades in.
  // Both halves move in the same downward direction → reads as continuous
  // motion rather than two opacities crossing.
  function initFocusTabs() {
    var tabs = document.querySelectorAll('[data-focus-tab]');
    var panels = document.querySelectorAll('[data-focus-panel]');
    if (!tabs.length || !panels.length) return;

    /* Timings tuned to Apple-style "considered" transitions — quick start,
       long deceleration, generous overlap so the eye never sees a gap. */
    var LEAVE_MS = 850;   /* match .is-leaving transition (transform 0.85s) */
    var OVERLAP_MS = 280; /* incoming begins while outgoing is ~1/3 done */
    var ENTER_MS = 1000;  /* match .is-active transition (transform 1s)  */
    var inFlight = false;

    function setTabState(index) {
      tabs.forEach(function (t, i) {
        t.setAttribute('aria-selected', i === index ? 'true' : 'false');
        t.setAttribute('tabindex', i === index ? '0' : '-1');
      });
    }

    function currentActiveIdx() {
      for (var k = 0; k < panels.length; k++) {
        if (panels[k].classList.contains('is-active')) return k;
      }
      return -1;
    }

    function activate(index) {
      var currentIdx = currentActiveIdx();
      if (currentIdx === index || inFlight) return;
      inFlight = true;
      setTabState(index);

      var leaving = currentIdx >= 0 ? panels[currentIdx] : null;
      var entering = panels[index];

      /* 1. Outgoing — drop the active flag and add leaving. */
      if (leaving) {
        leaving.classList.remove('is-active');
        leaving.classList.add('is-leaving');
        leaving.setAttribute('aria-hidden', 'true');
      }

      /* 2. Incoming start frame after a brief delay — positioned ABOVE
            and invisible. We then double-RAF before promoting to active
            so the browser commits the start frame before transitioning. */
      setTimeout(function () {
        entering.classList.add('is-entering');
        entering.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            entering.classList.remove('is-entering');
            entering.classList.add('is-active');
          });
        });
      }, OVERLAP_MS);

      /* 3. Cleanup leaving class after its transition completes. */
      if (leaving) {
        setTimeout(function () {
          leaving.classList.remove('is-leaving');
        }, LEAVE_MS);
      }

      /* Unlock for the next click after both transitions finish. */
      setTimeout(function () { inFlight = false; }, OVERLAP_MS + ENTER_MS);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i); });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          var next = (i + 1) % tabs.length;
          tabs[next].focus(); activate(next);
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = (i - 1 + tabs.length) % tabs.length;
          tabs[prev].focus(); activate(prev);
        }
        if (e.key === 'Home') { e.preventDefault(); tabs[0].focus(); activate(0); }
        if (e.key === 'End')  { e.preventDefault(); var L = tabs.length - 1; tabs[L].focus(); activate(L); }
      });
    });
  }

  // Block link/image dragging globally — CSS handles WebKit/Chromium
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
    // initParallax() removed — scroll-driven scale/opacity on the hero
    // caused a "growing" effect on slide 1 (no other slides got the
    // transform) and contributed to mobile scroll jitter as iOS Safari's
    // address bar collapsed. The slideshow is now truly static: photos
    // crossfade on a timer, content scrolls over them via the fixed bg.
    initCarouselDots();
    initImpactRings();
    initFocusTabs();
    initNewsletterForm();
    initHeroSlideshow();
    initIntro();
    initStoryParallax();
    initProjectHeroParallax();
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
  // to scroll while the section is on screen (IntersectionObserver) — this is
  // NOT the background-attachment / unthrottled scroll approach that caused
  // the old mobile jitter. Disabled entirely under prefers-reduced-motion,
  // leaving a clean static image. The resting scale keeps the photo larger
  // than its frame so the drift never exposes an edge.
  function initStoryParallax() {
    if (prefersReducedMotion) return;
    var photo = document.querySelector('.story-hero__photo');
    var img = photo && photo.querySelector('img');
    if (!img) return;

    var SCALE_MIN = 1.10;   /* zoom as the section enters view */
    var SCALE_MAX = 1.35;   /* zoom once it has travelled through — a slow push-in toward the child's gaze */
    var DRIFT = 0.03;       /* subtle supporting vertical parallax (fraction of photo height) */
    var active = false, ticking = false;

    function render() {
      ticking = false;
      var rect = photo.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      /* progress: +1 when the section sits fully below the fold, 0 at centre,
         -1 once it has travelled above — a smooth pass-through value. */
      var center = rect.top + rect.height / 2;
      var p = (center - vh / 2) / (vh / 2 + rect.height / 2);
      p = Math.max(-1, Math.min(1, p));
      /* t rises 0 -> 1 as you scroll the section up through the viewport, so
         the photo pushes in (zooms) the whole way — the dominant, cinematic
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
  // Scroll-linked push-in on the single hero photo — it zooms as you scroll
  // down past it, the same treatment as the Our Story portrait (a time-based
  // loop makes no sense for one still). Top-anchored mapping: scale 1 at rest,
  // growing toward 1.16 as the hero scrolls away. Desktop only — a scroll-
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

  // --- Intro / splash --------------------------------------
  // Brand loading bar shown for a SHORT FIXED window, then dismissed.
  // Deliberately NOT gated on hero-image decode: the previous version
  // held the splash until slide 1 finished decoding, which blocked the
  // hero from painting and tanked Speed Index on throttled connections.
  // The bar is a pure-CSS animation that paints the instant the markup
  // parses, so the brand moment is real without ever delaying content.
  // A navy fallback on .hero__bg means revealing before the photo has
  // decoded shows navy (not cream), then the photo fades in cleanly.
  function initIntro() {
    var intro = document.getElementById('intro');
    if (!intro) return;
    if (prefersReducedMotion) { intro.parentNode && intro.parentNode.removeChild(intro); return; }
    var SHOW_MS = 700;                         /* brief brand sweep — kept short so it costs minimal Speed Index */
    var FADE_MS = 900;                         /* matches .intro opacity transition */

    setTimeout(function () {
      intro.classList.add('is-dismissed');
      setTimeout(function () {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
      }, FADE_MS);
    }, SHOW_MS);
  }

  // --- Hero slideshow --------------------------------------
  // Crossfade between 9 hero photographs every ~5 seconds. Each slide
  // displays for ~3s then takes 2s to fade into the next. Pauses on tab
  // hide (visibilitychange) so the timer doesn't drift in background tabs.
  // Respects prefers-reduced-motion (stays on slide 1).
  function initHeroSlideshow() {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll('.hero__slideshow .hero__slide')
    );
    if (slides.length < 2 || prefersReducedMotion) return;

    var DWELL_MS = 3000;       /* time slide is fully visible */
    var FADE_MS = 2000;        /* crossfade duration */
    var TICK_MS = DWELL_MS + FADE_MS;
    var i = 0;
    var paused = false;

    /* Ken Burns push-in, driven from the slideshow so it stays in lock-step
       with the slides. Each slide zooms over TICK_MS + FADE_MS — slightly
       longer than its time on screen — so it's still gently moving as it
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
    }

    /* loadSlide(n) — promote data-src → src if not already loading, and
       resolve a Promise once the image has finished decoding. If the slide
       errors out we resolve anyway so the rotation never wedges. */
    function loadSlide(n) {
      var s = slides[n];
      if (!s) return Promise.resolve();
      if (!s.src && s.dataset && s.dataset.src) {
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
      if (paused) return;
      var next = (i + 1) % slides.length;
      var dwell = new Promise(function (r) { setTimeout(r, TICK_MS); });
      Promise.all([dwell, loadSlide(next)]).then(function () {
        if (paused) return;
        slides[i].classList.remove('is-active');
        slides[next].classList.add('is-active');
        zoom(slides[next]);            /* restart the push-in for the new slide */
        i = next;
        /* Greedy preload of N+1 so it's cached well before its turn. */
        loadSlide((i + 1) % slides.length);
        tick();
      });
    }

    /* Pause when tab is hidden so we don't crossfade in the background. */
    document.addEventListener('visibilitychange', function () {
      paused = document.hidden;
      if (!paused) tick();
    });

    /* Wait for slide 1 to actually be ready, then start the rotation
       (also pre-warm slide 2 immediately so it streams in parallel). */
    loadSlide(0).then(function () {
      loadSlide(1);
      zoom(slides[0]);              /* start the push-in on the first slide too */
      tick();
    });
  }

  // --- Newsletter form -------------------------------------
  // The form has no real backend yet (action="#"). To stop a broken page
  // reload, intercept submit, validate the email locally, then swap the
  // form for the success line. Real Mailchimp wiring goes here later.
  function initNewsletterForm() {
    var form = document.querySelector('[data-newsletter]');
    if (!form) return;
    var success = document.querySelector('[data-newsletter-success]');
    var input = form.querySelector('input[type="email"]');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = (input && input.value || '').trim();
      if (!emailRe.test(v)) {
        if (input) {
          input.focus();
          input.style.outline = '2px solid var(--red-light, #e08a8a)';
          setTimeout(function () { input.style.outline = ''; }, 1400);
        }
        return;
      }
      form.style.transition = 'opacity 0.35s var(--ease-out)';
      form.style.opacity = '0';
      setTimeout(function () {
        form.hidden = true;
        if (success) success.hidden = false;
      }, 400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
