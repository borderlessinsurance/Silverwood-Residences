// Silverwood Residences — redesign interactions
// Vanilla JS handles everything except the horizontal "How We Work" scroll,
// which uses GSAP + ScrollTrigger (loaded via CDN) and simply skips itself
// if that library fails to load — nothing else on the page depends on it.

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- preloader ----
  window.addEventListener('load', () => {
    setTimeout(() => document.body.classList.add('is-loaded'), 400);
  });
  // fallback in case 'load' is slow/never fires cleanly
  setTimeout(() => document.body.classList.add('is-loaded'), 2200);

  // ---- sticky header ----
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- mobile menu ----
  const menuToggle = document.getElementById('menuToggle');
  menuToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', () => header.classList.remove('nav-open'));
  });

  // ---- custom cursor ----
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  const cursorLabel = cursorRing ? cursorRing.querySelector('span') : null;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (cursorDot && cursorRing && !isTouch) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let hasMoved = false;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      if (!hasMoved) {
        hasMoved = true;
        cursorDot.classList.add('is-active');
        cursorRing.classList.add('is-active');
        rx = mx; ry = my; // snap the (lagging) ring to the cursor on first move, no fly-in from center
      }
    });
    const lerp = (a, b, n) => a + (b - a) * n;
    const raf = () => {
      rx = lerp(rx, mx, 0.16);
      ry = lerp(ry, my, 0.16);
      cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(raf);
    };
    raf();

    document.querySelectorAll('a, button, input, select, textarea, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('is-hover');
        const label = el.getAttribute('data-cursor');
        if (cursorLabel) cursorLabel.textContent = label || '';
        if (!label) cursorRing.classList.remove('is-hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('is-hover');
      });
    });
    document.addEventListener('mouseleave', () => {
      cursorDot.classList.add('is-hidden');
      cursorRing.classList.add('is-hidden');
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.classList.remove('is-hidden');
      cursorRing.classList.remove('is-hidden');
    });
  } else if (cursorDot && cursorRing) {
    cursorDot.style.display = 'none';
    cursorRing.style.display = 'none';
  }

  // ---- hero parallax (subtle background drift on scroll) ----
  const heroBg = document.getElementById('heroBg');
  if (heroBg && !reduceMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight * 1.2) {
            heroBg.style.transform = `scale(1.06) translateY(${y * 0.12}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- scroll reveal ----
  const revealTargets = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(el => io.observe(el));

  // ---- about photo curtain reveal ----
  const aboutFrame = document.getElementById('aboutFrame');
  if (aboutFrame) {
    const frameIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          aboutFrame.classList.add('is-revealed');
          frameIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    frameIo.observe(aboutFrame);
  }

  // ---- animated stat counters ----
  const counters = document.querySelectorAll('[data-count]');
  const countIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIo.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => countIo.observe(el));

  // ---- footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- "How We Work" pinned horizontal scroll (progressive enhancement) ----
  // Only runs if GSAP + ScrollTrigger loaded successfully and the viewport
  // is wide enough that a pinned horizontal scroll makes sense. Otherwise
  // the section just displays as the normal vertical stack already styled
  // in CSS — nothing breaks either way.
  const trackWrap = document.querySelector('.process-track-wrap');
  const track = document.getElementById('processTrack');
  if (
    typeof gsap !== 'undefined' &&
    typeof ScrollTrigger !== 'undefined' &&
    track && trackWrap &&
    window.innerWidth > 980 &&
    !reduceMotion
  ) {
    gsap.registerPlugin(ScrollTrigger);
    trackWrap.classList.add('js-pinned');
    requestAnimationFrame(() => {
      const scrollDistance = () => track.scrollWidth - trackWrap.clientWidth;
      const tween = gsap.to(track, {
        x: () => -scrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.process-pin',
          start: 'top top',
          end: () => '+=' + (scrollDistance() + window.innerHeight * 0.4),
          scrub: 0.4,
          pin: true,
          invalidateOnRefresh: true,
        }
      });
    });
  }
});
