/* =============================================================
   AURUM – Fine Dining Restaurant | script.js
   ============================================================= */

'use strict';

// ── Utility: DOM selector helpers ─────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─────────────────────────────────────────────────────────────
// 1. NAVBAR – scroll class + active link
// ─────────────────────────────────────────────────────────────
(function initNavbar() {
  const navbar = $('#navbar');
  const links  = $$('.nav-link');

  // Add 'scrolled' class when page scrolls past hero
  const onScroll = () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else                      navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight active nav link based on scroll position
  const sections = $$('section[id]');
  const highlightNav = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(l => {
      const href = l.getAttribute('href')?.replace('#', '');
      l.classList.toggle('active', href === current);
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });
})();

// ─────────────────────────────────────────────────────────────
// 2. HAMBURGER MENU
// ─────────────────────────────────────────────────────────────
(function initMobileMenu() {
  const btn     = $('#hamburger');
  const navLinks = $('#navLinks');
  if (!btn || !navLinks) return;

  const toggle = () => {
    const open = navLinks.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', toggle);

  // Close on link click
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on backdrop click (outside nav)
  document.addEventListener('click', e => {
    if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && e.target !== btn) {
      navLinks.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();

// ─────────────────────────────────────────────────────────────
// 3. SCROLL REVEAL ANIMATION
// ─────────────────────────────────────────────────────────────
(function initReveal() {
  const elements = $$('.reveal-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

// ─────────────────────────────────────────────────────────────
// 4. MENU TABS
// ─────────────────────────────────────────────────────────────
(function initMenuTabs() {
  const tabs     = $$('.tab-btn');
  const contents = $$('.tab-content');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tab buttons
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Swap content panels
      contents.forEach(panel => {
        const isTarget = panel.id === `tab-${target}`;
        panel.classList.toggle('active', isTarget);

        // Re-trigger reveal animations for newly shown cards
        if (isTarget) {
          $$('.reveal-up', panel).forEach(el => {
            el.classList.remove('visible');
            // Small timeout so the CSS transition fires
            setTimeout(() => el.classList.add('visible'), 20);
          });
        }
      });
    });
  });
})();

// ─────────────────────────────────────────────────────────────
// 5. GALLERY LIGHTBOX
// ─────────────────────────────────────────────────────────────
(function initLightbox() {
  const lightbox = $('#lightbox');
  const lbImg    = $('#lightboxImg');
  const lbClose  = $('#lightboxClose');
  const items    = $$('.gallery-item');
  if (!lightbox) return;

  const open = src => {
    lbImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  };

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = $('img', item);
      if (img) open(img.src);
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter') item.click();
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  lbClose.addEventListener('click', close);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
})();

// ─────────────────────────────────────────────────────────────
// 6. TESTIMONIALS SLIDER
// ─────────────────────────────────────────────────────────────
(function initSlider() {
  const track   = $('#testimonialTrack');
  const prevBtn = $('#sliderPrev');
  const nextBtn = $('#sliderNext');
  const dotsWrap= $('#sliderDots');
  if (!track) return;

  const cards = $$('.testimonial-card', track);
  let current = 0;
  let autoTimer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to review ${i + 1}`);
    dot.setAttribute('role', 'listitem');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = () => $$('.dot', dotsWrap);

  const goTo = idx => {
    current = (idx + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots().forEach((d, i) => d.classList.toggle('active', i === current));
  };

  prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  // Auto-advance
  const startAuto = () => { autoTimer = setInterval(() => goTo(current + 1), 5500); };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

  // Pause on hover
  track.closest('.testimonials-slider')?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.closest('.testimonials-slider')?.addEventListener('mouseleave', startAuto);

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
  });

  startAuto();
})();

// ─────────────────────────────────────────────────────────────
// 7. RESERVATION FORM VALIDATION
// ─────────────────────────────────────────────────────────────
(function initForm() {
  const form    = $('#reservationForm');
  const success = $('#formSuccess');
  if (!form) return;

  // Set minimum date to today
  const dateInput = $('#date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  const showError = (input, msg) => {
    input.classList.add('error');
    const errEl = input.nextElementSibling;
    if (errEl && errEl.classList.contains('form-error')) errEl.textContent = msg;
  };
  const clearError = input => {
    input.classList.remove('error');
    const errEl = input.nextElementSibling;
    if (errEl && errEl.classList.contains('form-error')) errEl.textContent = '';
  };

  // Live validation on blur
  $$('input[required], select[required]', form).forEach(input => {
    input.addEventListener('blur', () => {
      if (!input.value.trim()) showError(input, 'This field is required');
      else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        showError(input, 'Please enter a valid email');
      } else {
        clearError(input);
      }
    });
    input.addEventListener('input', () => clearError(input));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    // Validate required fields
    $$('input[required], select[required]', form).forEach(input => {
      if (!input.value.trim()) { showError(input, 'This field is required'); valid = false; }
      else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        showError(input, 'Please enter a valid email'); valid = false;
      }
    });

    if (!valid) return;

    // Simulate submission (replace with real API call)
    const submitBtn = $('button[type="submit"]', form);
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      success.style.display = 'flex';
      submitBtn.textContent = 'Confirm Reservation';
      submitBtn.disabled = false;
      setTimeout(() => { success.style.display = 'none'; }, 8000);
    }, 1200);
  });
})();

// ─────────────────────────────────────────────────────────────
// 8. BACK TO TOP BUTTON
// ─────────────────────────────────────────────────────────────
(function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ─────────────────────────────────────────────────────────────
// 9. SMOOTH SCROLL for anchor links
// ─────────────────────────────────────────────────────────────
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      const navH = $('#navbar')?.offsetHeight || 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ─────────────────────────────────────────────────────────────
// 10. MICRO-INTERACTIONS – button ripple effect
// ─────────────────────────────────────────────────────────────
(function initRipple() {
  $$('.btn, .tab-btn, .slider-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        background:rgba(255,255,255,0.18);
        transform:scale(0); animation:rippleAnim 0.55s ease forwards;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject ripple keyframe if not already in DOM
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = '@keyframes rippleAnim { to { transform:scale(2.5); opacity:0; } }';
    document.head.appendChild(style);
  }
})();

// ─────────────────────────────────────────────────────────────
// 11. LAZY IMAGE OBSERVER (polyfill for older browsers)
// ─────────────────────────────────────────────────────────────
(function initLazyImages() {
  // Only needed if browser doesn't support native loading="lazy"
  if ('loading' in HTMLImageElement.prototype) return;
  const imgs = $$('img[loading="lazy"]');
  const lazyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        lazyObserver.unobserve(img);
      }
    });
  });
  imgs.forEach(img => lazyObserver.observe(img));
})();

// ─────────────────────────────────────────────────────────────
// 12. COUNTER ANIMATION (for future stat sections)
// ─────────────────────────────────────────────────────────────
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}

// Observe counters when they scroll into view
(function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target, +entry.target.dataset.count);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
})();
