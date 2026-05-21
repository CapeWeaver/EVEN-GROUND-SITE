/* ============================================================
   EVEN GROUND — Main JavaScript
   Scroll reveals, nav behavior, counters, mobile menu
   ============================================================ */

(function () {
  'use strict';

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

  // --- Mobile menu -----------------------------------------
  function initMobileMenu() {
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileNav = document.querySelector('.nav__mobile');
    if (!hamburger || !mobileNav) return;

    function openMenu() {
      hamburger.classList.add('open');
      mobileNav.classList.add('open');
      mobileNav.removeAttribute('inert');
      mobileNav.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('inert', '');
      mobileNav.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
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
              el.textContent = prefix + target.toLocaleString() + suffix;
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

  function animateCounter(el, target, prefix, suffix) {
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      el.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  // --- Smooth scroll for anchor links ----------------------
  // Uses CSS scroll-margin-top on sections for offset
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const hash = link.getAttribute('href');
        if (hash === '#') return;

        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // --- Active nav link -------------------------------------
  function initActiveNav() {
    const sections = Array.prototype.slice.call(
      document.querySelectorAll('section[id]')
    );
    if (!sections.length) return;

    const navLinks = document.querySelectorAll('.nav__links a[href*="#"]');
    const partnersTrigger = document.querySelector('.nav__dropdown-trigger');

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
      if (partnersTrigger) {
        if (id === 'partners') {
          partnersTrigger.setAttribute('aria-current', 'page');
        } else {
          partnersTrigger.removeAttribute('aria-current');
        }
      }
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
        if (partnersTrigger) partnersTrigger.removeAttribute('aria-current');
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

  // --- Init ------------------------------------------------
  function init() {
    initNav();
    initMobileMenu();
    initNavDropdown();
    initReveal();
    initCounters();
    initSmoothScroll();
    initActiveNav();
    initParallax();
    initCarouselDots();
    initImpactRings();
    initFocusTabs();
    initNewsletterForm();
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
