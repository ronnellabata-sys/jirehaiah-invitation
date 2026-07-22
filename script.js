'use strict';

/* =========================================================
   FAIRY DUST PARTICLES
   ========================================================= */

(function initFairyDust() {
  const container = document.getElementById('fairyDust');
  if (!container) return;
  const count = 25;
  for (let i = 0; i < count; i++) {
    const dust = document.createElement('div');
    dust.className = 'fairy-dust';
    dust.style.left = Math.random() * 100 + '%';
    dust.style.animationDuration = (6 + Math.random() * 8) + 's';
    dust.style.animationDelay = (Math.random() * 10) + 's';
    const size = (2 + Math.random() * 4) + 'px';
    dust.style.width = size;
    dust.style.height = size;
    container.appendChild(dust);
  }
})();

/* =========================================================
   SCROLL REVEAL
   ========================================================= */

(function initScrollReveal() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');

  if (reduceMotion) {
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
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
})();

/* =========================================================
   MOBILE NAVIGATION TOGGLE
   ========================================================= */

(function initMobileNav() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-navigation');
  if (!toggle || !nav) return;

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  });

  // Close menu on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on resize past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1050) closeMenu();
  });
})();

/* =========================================================
   ACTIVE NAV LINK — Intersection Observer
   ========================================================= */

(function initActiveNav() {
  const navLinks = document.querySelectorAll('.primary-navigation a');
  const sections = document.querySelectorAll('main section[id]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href') || '';
          link.classList.toggle('active', href === '#' + id);
        });
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach(s => observer.observe(s));
})();

/* =========================================================
   COUNTDOWN TIMER
   ========================================================= */

(function initCountdown() {
  // Philippine time: 2026-07-25 00:00:00 PHT (UTC+8)
  const TARGET = new Date('2026-07-25T00:00:00+08:00').getTime();

  const daysEl    = document.getElementById('cd-days');
  const hoursEl   = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');
  const arrivedEl = document.getElementById('countdownArrived');
  const timerEl   = document.getElementById('countdownTimer');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  let intervalId = null;

  function updateCountdown() {
    const now = Date.now();
    let diff = TARGET - now;

    if (diff <= 0) {
      // Countdown reached zero
      clearInterval(intervalId);
      intervalId = null;
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      if (timerEl)    timerEl.style.display = 'none';
      if (arrivedEl)  arrivedEl.style.display = 'block';
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent    = String(days).padStart(2, '0');
    hoursEl.textContent   = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  intervalId = setInterval(updateCountdown, 1000);
})();

/* =========================================================
   PHOTO CAROUSEL
   ========================================================= */

(function initGallery() {
  const track = document.getElementById('galleryTrack');
  const cards = [...document.querySelectorAll('.gallery-card')];
  const prevBtn = document.querySelector('.gallery-prev');
  const nextBtn = document.querySelector('.gallery-next');
  const dotsContainer = document.getElementById('galleryDots');

  if (!track || !cards.length) return;

  let activeSlide = Math.floor(cards.length / 2);

  // Build dots
  if (dotsContainer) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot';
      dot.setAttribute('aria-label', 'Show photo ' + (i + 1));
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', 'false');
      dot.addEventListener('click', () => {
        activeSlide = i;
        updateGallery();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function getDots() {
    return [...dotsContainer ? dotsContainer.querySelectorAll('.gallery-dot') : []];
  }

  function getCircularOffset(index, active, total) {
    let offset = index - active;
    if (offset > total / 2)  offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  }

  function updateGallery() {
    const total = cards.length;

    cards.forEach((card, index) => {
      const offset = getCircularOffset(index, activeSlide, total);
      const abs = Math.abs(offset);
      const tx = offset * 55;            // % translateX
      const ty = abs * 18;               // px translateY
      const rot = offset * 6;            // deg
      const scale = Math.max(0.72, 1 - abs * 0.12);
      const opacity = abs > 2 ? 0 : Math.max(0.28, 1 - abs * 0.24);
      const blur = abs > 1 ? 1.2 : 0;

      card.style.transform =
        'translate(-50%,-50%)' +
        ' translateX(' + tx + '%)' +
        ' translateY(' + ty + 'px)' +
        ' rotate(' + rot + 'deg)' +
        ' scale(' + scale + ')';

      card.style.opacity = String(opacity);
      card.style.filter  = 'blur(' + blur + 'px)';
      card.style.zIndex  = String(10 - abs);
      card.classList.toggle('is-active', index === activeSlide);
      card.setAttribute('aria-hidden', String(index !== activeSlide));
    });

    const dots = getDots();
    dots.forEach((dot, i) => {
      const active = i === activeSlide;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', String(active));
    });
  }

  function moveGallery(direction) {
    activeSlide = (activeSlide + direction + cards.length) % cards.length;
    updateGallery();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => moveGallery(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => moveGallery(1));

  // Touch / drag
  let touchStartX = 0;
  let touchStartY = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      moveGallery(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  // Mouse drag
  let mouseDown = false;
  let mouseStartX = 0;

  track.addEventListener('mousedown', (e) => {
    mouseDown = true;
    mouseStartX = e.clientX;
    e.preventDefault();
  });

  window.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    const dx = e.clientX - mouseStartX;
    if (Math.abs(dx) > 40) {
      moveGallery(dx < 0 ? 1 : -1);
    }
  });

  // Keyboard arrows when gallery section is in view
  document.addEventListener('keydown', (e) => {
    const photosSection = document.getElementById('photos');
    if (!photosSection) return;
    const rect = photosSection.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); moveGallery(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); moveGallery(1); }
  });

  updateGallery();
})();

/* =========================================================
   RSVP FORM
   ========================================================= */

(function initRSVP() {
  const form = document.getElementById('rsvpForm');
  const statusEl = document.getElementById('form-status');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const rsvpFrame = document.getElementById('rsvpSubmitFrame');
  if (!form || !statusEl || !submitBtn || !rsvpFrame) return;

  let rsvpIsSubmitting = false;
  let rsvpSubmissionStarted = false;
  let rsvpSubmissionCompleted = false;
  let rsvpTimeoutId = null;
  const ORIGINAL_BTN_TEXT = submitBtn.textContent;
  const TIMEOUT_MS = 30000;

  function showFieldError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    const wrapper = field.closest('.form-field');
    const errEl = wrapper ? wrapper.querySelector('.field-error') : null;
    if (errEl) errEl.textContent = message;
  }

  function clearFieldError(field) {
    field.removeAttribute('aria-invalid');
    const wrapper = field.closest('.form-field');
    const errEl = wrapper ? wrapper.querySelector('.field-error') : null;
    if (errEl) errEl.textContent = '';
  }

  function validateForm() {
    const nameField     = form.elements.fullName;
    const contactField  = form.elements.contactNumber;
    const attendField   = form.elements.attendanceConfirmation;
    const guestsField   = form.elements.numberOfGuests;

    [nameField, contactField, attendField, guestsField].forEach(clearFieldError);

    let valid = true;

    if (!nameField.value.trim()) {
      showFieldError(nameField, 'Please enter your full name.');
      valid = false;
    }

    if (!contactField.value.trim()) {
      showFieldError(contactField, 'Please enter your contact number.');
      valid = false;
    } else if (!/^[+\d][\d\s\-().]{6,}$/.test(contactField.value.trim())) {
      showFieldError(contactField, 'Please enter a valid contact number.');
      valid = false;
    }

    if (!attendField.value) {
      showFieldError(attendField, 'Please select an option.');
      valid = false;
    }

    const guests = Number(guestsField.value);
    if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
      showFieldError(guestsField, 'Enter a number from 1 to 20.');
      valid = false;
    }

    return valid;
  }

  function setStatus(message, color) {
    statusEl.textContent = message;
    statusEl.style.color = color || 'var(--mint-deep)';
  }

  function completeRsvpSubmissionSuccess() {
    if (rsvpSubmissionCompleted) return;
    rsvpSubmissionCompleted = true;
    rsvpIsSubmitting = false;
    rsvpSubmissionStarted = false;
    clearTimeout(rsvpTimeoutId);

    form.reset();
    form.querySelectorAll('[aria-invalid="true"]').forEach(f => {
      f.removeAttribute('aria-invalid');
      const wrapper = f.closest('.form-field');
      const errEl = wrapper ? wrapper.querySelector('.field-error') : null;
      if (errEl) errEl.textContent = '';
    });

    setStatus('Thank you! Your RSVP has been received.', 'var(--mint-deep)');
    submitBtn.disabled = false;
    submitBtn.textContent = ORIGINAL_BTN_TEXT;
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function startTimeout() {
    clearTimeout(rsvpTimeoutId);
    rsvpTimeoutId = setTimeout(() => {
      if (!rsvpIsSubmitting) return;
      rsvpIsSubmitting = false;
      submitBtn.disabled = true;
      setStatus('Your RSVP was sent, but confirmation is taking longer than expected. Please do not submit it again.', '#D4566A');
      statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = ORIGINAL_BTN_TEXT;
      }, 2000);
    }, TIMEOUT_MS);
  }

  // Hidden iframe load fallback confirmation
  rsvpFrame.addEventListener('load', function () {
    if (!rsvpSubmissionStarted) return;
    if (!rsvpIsSubmitting) return;
    if (rsvpSubmissionCompleted) return;

    setTimeout(function () {
      completeRsvpSubmissionSuccess();
    }, 500);
  });

  // Optional primary confirmation from Apps Script postMessage
  window.addEventListener('message', (event) => {
    if (!event.data || event.data.source !== 'jirehaiah-rsvp') return;
    if (event.data.success !== true) return;

    clearTimeout(rsvpTimeoutId);
    completeRsvpSubmissionSuccess();
  });

  // Clear errors on input
  form.addEventListener('input', (e) => {
    if (e.target.matches('input, select, textarea')) {
      clearFieldError(e.target);
    }
    if (statusEl.textContent) setStatus('');
  });

  form.addEventListener('submit', (e) => {
    if (rsvpIsSubmitting) {
      e.preventDefault();
      return;
    }

    if (!validateForm()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      setStatus('Please review the highlighted fields.', '#D4566A');
      return;
    }

    rsvpIsSubmitting = true;
    rsvpSubmissionStarted = true;
    rsvpSubmissionCompleted = false;
    submitBtn.disabled = true;
    submitBtn.textContent = 'SENDING...';
    setStatus('');

    startTimeout();
    // Allow the form to submit naturally to the Apps Script endpoint via the hidden iframe
  });
})();

/* =========================================================
   BACK TO TOP
   ========================================================= */

(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function onScroll() {
    btn.classList.toggle('show', window.scrollY > 400);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  onScroll();
})();

/* =========================================================
   CURRENT YEAR
   ========================================================= */

(function setCurrentYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = String(new Date().getFullYear());
})();
