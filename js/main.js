/* ============================================================
   THE STAINLESS (INDIA) — core interaction layer
   Nav, cursor, mobile menu, forms, WhatsApp, modals, lightbox
   ============================================================ */
(function () {
  'use strict';

  const WHATSAPP_NUMBER = '919367725423';
  const PHONE_DISPLAY = '+91 93677 25423';

  window.TSI = window.TSI || {};
  window.TSI.WHATSAPP_NUMBER = WHATSAPP_NUMBER;
  window.TSI.PHONE_DISPLAY = PHONE_DISPLAY;

  window.TSI.waLink = function (message) {
    const msg = encodeURIComponent(message || 'Hello THE STAINLESS (INDIA), I would like to know more about your products and services.');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.toggle('reduced-motion', prefersReducedMotion);

  /* ---------------- Header scroll state ---------------- */
  const header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------------- Scroll progress bar ---------------- */
  const progressBar = document.querySelector('.scroll-progress');
  function onScrollProgress() {
    if (!progressBar) return;
    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.transform = `scaleX(${ratio})`;
  }
  onScrollProgress();
  window.addEventListener('scroll', onScrollProgress, { passive: true });

  /* ---------------- Mobile menu ---------------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------- Active nav link ---------------- */
  const currentPage = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-desktop a, .mobile-menu a, .mobile-bar a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------------- Custom cursor (desktop only) ---------------- */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && !prefersReducedMotion) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .magnetic, input, textarea, select, .cert-thumb').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (canHover && !prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------- WhatsApp / tel links wiring ---------------- */
  document.querySelectorAll('[data-wa]').forEach((el) => {
    const msg = el.getAttribute('data-wa') || '';
    el.setAttribute('href', window.TSI.waLink(msg));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
  document.querySelectorAll('[data-tel]').forEach((el) => {
    el.setAttribute('href', `tel:+${WHATSAPP_NUMBER}`);
  });
  document.querySelectorAll('.js-phone-display').forEach((el) => { el.textContent = PHONE_DISPLAY; });

  /* ---------------- Generic modal open/close ---------------- */
  document.querySelectorAll('[data-modal-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-modal-open');
      const modal = document.getElementById(id);
      if (modal) { modal.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) { modal.classList.remove('is-open'); document.body.style.overflow = ''; }
    });
  });
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { overlay.classList.remove('is-open'); document.body.style.overflow = ''; }
    });
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.is-open').forEach((m) => { m.classList.remove('is-open'); document.body.style.overflow = ''; });
      closeLightbox();
    }
  });

  /* ---------------- Expandable list (accordion) ---------------- */
  document.querySelectorAll('.expand-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.expand-item');
      const panel = item.querySelector('.expand-panel');
      const isOpen = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.expand-item.is-open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.expand-panel').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('is-open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------------- Pill group (enquiry type selector) ---------------- */
  document.querySelectorAll('.pill-group').forEach((group) => {
    const hiddenInput = group.parentElement.querySelector('input[type="hidden"]');
    group.querySelectorAll('.pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        group.querySelectorAll('.pill').forEach((p) => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        if (hiddenInput) hiddenInput.value = pill.textContent.trim();
      });
    });
  });

  /* ---------------- Certificate / gallery lightbox ---------------- */
  let lightboxItems = [];
  let lightboxIndex = 0;
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;

  function openLightbox(items, index) {
    lightboxItems = items; lightboxIndex = index;
    renderLightbox();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function renderLightbox() {
    if (!lightboxImg) return;
    const item = lightboxItems[lightboxIndex];
    lightboxImg.src = item.full;
    lightboxImg.alt = item.title || '';
    if (lightboxCaption) lightboxCaption.textContent = item.title || '';
  }
  if (lightbox) {
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
    const nextBtn = lightbox.querySelector('.lightbox-nav.next');
    if (prevBtn) prevBtn.addEventListener('click', () => { lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length; renderLightbox(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { lightboxIndex = (lightboxIndex + 1) % lightboxItems.length; renderLightbox(); });
    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
      if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
    });
  }
  window.TSI.openLightbox = openLightbox;

  const galleryTriggers = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (galleryTriggers.length) {
    const items = galleryTriggers.map((el) => ({
      full: el.getAttribute('data-full') || el.getAttribute('src'),
      title: el.getAttribute('data-title') || '',
    }));
    galleryTriggers.forEach((el, i) => {
      el.addEventListener('click', () => openLightbox(items, i));
    });
  }

  /* ---------------- Forms → WhatsApp handoff ---------------- */
  document.querySelectorAll('form[data-wa-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const template = form.getAttribute('data-wa-form');
      const data = new FormData(form);
      const get = (k) => (data.get(k) || '').toString().trim();
      let lines = [];
      form.querySelectorAll('[name]').forEach((field) => {
        const name = field.getAttribute('name');
        const labelEl = form.querySelector(`label[for="${field.id}"]`);
        const label = labelEl ? labelEl.textContent.trim() : name;
        const val = get(name);
        if (val && field.type !== 'file' && field.type !== 'hidden') {
          lines.push(`${label}: ${val}`);
        } else if (val && field.type === 'hidden') {
          lines.push(`${label}: ${val}`);
        }
      });
      const heading = template === 'sell' ? 'New Scrap Sell Enquiry — THE STAINLESS (INDIA)'
        : template === 'supply' ? 'Material Request — THE STAINLESS (INDIA)'
        : 'New Enquiry — THE STAINLESS (INDIA)';
      const message = `${heading}\n\n${lines.join('\n')}`;
      const successEl = form.parentElement.querySelector('.form-success');
      if (successEl) {
        form.style.display = 'none';
        successEl.classList.add('is-visible');
        const waBtn = successEl.querySelector('[data-wa-dynamic]');
        if (waBtn) waBtn.setAttribute('href', window.TSI.waLink(message));
      } else {
        window.open(window.TSI.waLink(message), '_blank');
      }
    });
  });

  /* file input label update */
  document.querySelectorAll('.file-drop input[type="file"]').forEach((input) => {
    input.addEventListener('change', () => {
      const label = input.closest('.file-drop').querySelector('.file-drop-text');
      if (!label) return;
      if (input.files.length) {
        label.textContent = Array.from(input.files).map((f) => f.name).join(', ');
      }
    });
  });

  /* ---------------- Year in footer ---------------- */
  document.querySelectorAll('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });

})();
