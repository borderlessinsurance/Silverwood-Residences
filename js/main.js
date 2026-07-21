// Silverwood Residences — site interactions
// Vanilla JS, no build step, no dependencies.

document.addEventListener('DOMContentLoaded', () => {

  // ---- sticky header background on scroll ----
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- mobile menu toggle ----
  const menuToggle = document.getElementById('menuToggle');
  menuToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // close mobile menu after tapping a nav link
  document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', () => header.classList.remove('nav-open'));
  });

  // ---- scroll-reveal for sections ----
  const revealTargets = document.querySelectorAll(
    '.about-grid, .section-head, .building-card, .process-step, .quote-section blockquote, .contact-grid'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => io.observe(el));

  // ---- footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
