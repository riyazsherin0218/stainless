/* ============================================================
   THE STAINLESS (INDIA) — GSAP-driven motion system
   Scroll reveals, headline reveal, process activation, counters
   ============================================================ */
(function () {
  'use strict';
  if (typeof gsap === 'undefined') return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Page load intro ---------------- */
  window.addEventListener('load', () => {
    document.documentElement.classList.add('is-loaded');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero-kicker', { opacity: 1, y: 0, duration: reduced ? 0.01 : 0.6 }, 0.1);
    tl.to('.hero h1 .line span', { yPercent: 0, duration: reduced ? 0.01 : 0.9, stagger: 0.09 }, 0.15);
    tl.to('.hero-sub', { opacity: 1, y: 0, duration: reduced ? 0.01 : 0.7 }, '-=0.5');
    tl.to('.hero-cta', { opacity: 1, y: 0, duration: reduced ? 0.01 : 0.7 }, '-=0.5');
    tl.to('.hero-trust', { opacity: 1, y: 0, duration: reduced ? 0.01 : 0.6 }, '-=0.45');
  });

  /* initial states for hero */
  gsap.set('.hero-kicker, .hero-sub, .hero-cta, .hero-trust', { opacity: 0, y: 24 });
  gsap.set('.hero h1 .line span', { yPercent: 110 });

  /* ---------------- Generic scroll reveals ----------------
     Elements are visible by default (see CSS). We only hide them the
     instant before wiring a working ScrollTrigger reveal, so a failed/slow
     GSAP load never leaves content stuck invisible. */
  if (window.ScrollTrigger) {
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.set(el, { opacity: 0, y: 40 });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });
    gsap.utils.toArray('.reveal-scale').forEach((el) => {
      gsap.set(el, { opacity: 0, scale: 0.94 });
      gsap.to(el, {
        opacity: 1, scale: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });
    gsap.utils.toArray('.reveal-clip').forEach((el) => {
      gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
      gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
    gsap.utils.toArray('[data-stagger]').forEach((group) => {
      const children = group.children;
      gsap.from(children, {
        opacity: 0, y: 30, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 85%' },
      });
    });

    /* process line fill + step activation */
    const processEl = document.querySelector('.process');
    if (processEl) {
      const steps = processEl.querySelectorAll('.process-step');
      const fill = processEl.querySelector('.process-line-fill');
      ScrollTrigger.create({
        trigger: processEl,
        start: 'top 70%',
        end: 'bottom 60%',
        onUpdate: (self) => {
          const p = self.progress;
          if (fill) fill.style.width = (p * 100) + '%';
          steps.forEach((step, i) => {
            const threshold = i / steps.length;
            step.classList.toggle('is-active', p >= threshold);
          });
        },
      });
    }

    /* animated stat counters */
    gsap.utils.toArray('.stat .num[data-count-to]').forEach((el) => {
      const to = parseFloat(el.getAttribute('data-count-to'));
      const suffix = el.getAttribute('data-suffix') || '';
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: to, duration: 1.6, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
          });
        },
      });
    });

    /* parallax editorial visuals */
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      gsap.to(el, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  } else {
    // No ScrollTrigger fallback: reveal everything immediately
    document.querySelectorAll('.reveal, .reveal-scale, .reveal-clip').forEach((el) => {
      el.style.opacity = 1; el.style.transform = 'none'; el.style.clipPath = 'none';
    });
  }

})();
