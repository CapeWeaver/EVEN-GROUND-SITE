/* ============================================================
   EVEN GROUND — Main JavaScript
   Scroll reveals, nav behavior, counters, mobile menu
   ============================================================ */

(function () {
  'use strict';

  // --- Scroll Reveal (Intersection Observer) ---------------
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }

  // --- Counter animation -----------------------------------
  function initCounters() {
    const counters = document.querySelectorAll('.counter[data-target]');
    if (!counters.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { threshold: 0.05, rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach(section => observer.observe(section));
  }

  // --- Parallax on heroes ----------------------------------
  function initParallax() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    var pageHero = document.querySelector('.page-hero');
    var mainHero = document.querySelector('.hero');
    var ticking = false;

    if (!pageHero && !mainHero) return;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.scrollY;

          // Page hero (sub-pages) — content parallax + fade
          if (pageHero) {
            var content = pageHero.querySelector('.container');
            var h = pageHero.offsetHeight;
            if (scrollY < h && content) {
              var progress = scrollY / h;
              content.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
              content.style.opacity = 1 - progress * 1.2;
            }
          }

          // Main hero — image zooms out, content fades up
          if (mainHero) {
            var bgImg = mainHero.querySelector('.hero__bg img');
            var heroContent = mainHero.querySelector('.hero__content');
            var mh = mainHero.offsetHeight;
            if (scrollY < mh) {
              var p = scrollY / mh;
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

  // --- Carousel dots ---------------------------------------
  function initCarouselDots() {
    var grid = document.querySelector('.partner-grid');
    var dotsContainer = document.getElementById('partnerDots');
    if (!grid || !dotsContainer) return;

    var cards = grid.querySelectorAll('.partner-card');
    cards.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to partner ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', function () {
        cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      });
      dotsContainer.appendChild(dot);
    });

    var dots = dotsContainer.querySelectorAll('button');

    grid.addEventListener('scroll', function () {
      var scrollLeft = grid.scrollLeft;
      var cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(grid).gap);
      var activeIndex = Math.round(scrollLeft / cardWidth);
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === activeIndex);
      });
    }, { passive: true });
  }

  // --- Init ------------------------------------------------
  function init() {
    initNav();
    initMobileMenu();
    initReveal();
    initCounters();
    initSmoothScroll();
    initActiveNav();
    initParallax();
    initCarouselDots();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
