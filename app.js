/**
 * TRIDEVA EXPORTS — MASTER 3D SPATIAL INTERACTION ENGINE
 * Hardware-accelerated 3D Card Physics, Specular Glare,
 * Mobile Gyroscope Tilt & AI Trade Desk Console
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  document.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    init3DCardPhysics();
    initMobileGyroscope();
    initAIAssistant();
    initDynamicYear();
    initSmoothNavigation();
  }

  /* ==========================================================================
     1. HARDWARE-ACCELERATED 3D CARD TILT & SPECULAR GLARE
     ========================================================================== */
  function init3DCardPhysics() {
    const cards = document.querySelectorAll('.commodity-card, .trade-node, .metric-node');
    if (!cards.length || prefersReducedMotion) return;

    cards.forEach((card) => {
      let animFrame = null;

      const resetCard = () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');
      };

      const handleMove = (e) => {
        // Gyroscope handles touch devices separately
        if (isTouchDevice && e.pointerType !== 'mouse') return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const percentX = Math.max(0, Math.min(1, x / rect.width));
        const percentY = Math.max(0, Math.min(1, y / rect.height));

        // Refined tilt angles (6 degrees max for elegant luxury feel)
        const maxTilt = 6.5;
        const rotateY = (percentX - 0.5) * maxTilt * 2;
        const rotateX = (0.5 - percentY) * maxTilt * 2;

        if (animFrame) cancelAnimationFrame(animFrame);

        animFrame = requestAnimationFrame(() => {
          card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
          card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        });
      };

      card.addEventListener('pointermove', handleMove, { passive: true });
      card.addEventListener('pointerleave', resetCard);
      card.addEventListener('pointercancel', resetCard);
    });
  }

  /* ==========================================================================
     2. SMARTPHONE GYROSCOPE PHYSICAL TILT
     ========================================================================== */
  function initMobileGyroscope() {
    if (prefersReducedMotion || !isTouchDevice || !('DeviceOrientationEvent' in window)) return;

    const cards = document.querySelectorAll('.commodity-card');
    if (!cards.length) return;

    let gyroActive = false;

    const handleOrientation = (e) => {
      if (!gyroActive) return;

      const gamma = Number(e.gamma) || 0; // Left to right [-90, 90]
      const beta = Number(e.beta) || 0;   // Front to back [-180, 180]

      // Subtle reactive tilt as user tilts phone
      const rotY = Math.max(-5, Math.min(5, gamma / 6));
      const rotX = Math.max(-5, Math.min(5, (beta - 45) / 8));

      cards.forEach((card) => {
        card.style.setProperty('--rx', `${-rotX.toFixed(2)}deg`);
        card.style.setProperty('--ry', `${rotY.toFixed(2)}deg`);
      });
    };

    const requestGyroPermission = async () => {
      try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          const res = await DeviceOrientationEvent.requestPermission();
          if (res !== 'granted') return;
        }
        gyroActive = true;
        window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      } catch (_) {
        // Gyroscope permission denied or unavailable, silent fallback
      }
    };

    // iOS requires permission request initiated from a user touch gesture
    window.addEventListener('touchstart', requestGyroPermission, { once: true, passive: true });
  }

  /* ==========================================================================
     3. AI TRADE DESK ASSISTANT HUD
     ========================================================================== */
  function initAIAssistant() {
    const launcher = document.getElementById('aiLauncher');
    const windowEl = document.getElementById('aiWindow');
    const closeBtn = document.getElementById('aiClose');
    const form = document.getElementById('aiForm');
    const input = document.getElementById('aiInput');
    const messages = document.getElementById('aiMessages');

    if (!launcher || !windowEl || !closeBtn || !form || !input || !messages) return;

    // Toggle chat window
    launcher.addEventListener('click', () => {
      const isOpen = windowEl.classList.toggle('active');
      launcher.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        setTimeout(() => input.focus(), 150);
      }
    });

    closeBtn.addEventListener('click', () => {
      windowEl.classList.remove('active');
      launcher.setAttribute('aria-expanded', 'false');
    });

    // Auto-scroll messages to bottom
    const scrollToBottom = () => {
      messages.scrollTop = messages.scrollHeight;
    };

    // Commercial Knowledge Base responses for Trade Inquiries
    function getTradeResponse(query) {
      const q = query.toLowerCase();
      if (q.includes('isabgol') || q.includes('psyllium')) {
        return "We supply premium Indian Isabgol (Psyllium Husk) in 85%, 95%, and 99% USP purity grades, sourced directly from Rajasthan/Gujarat. We pack in multi-ply paper or PP bags. Would you like a CIF quotation for your destination port?";
      }
      if (q.includes('fenugreek') || q.includes('methi')) {
        return "Our whole Fenugreek Seeds are Machine Cleaned and Sortex Graded (99% pure), with rich aroma and uniform color. Typical export packing is in 25kg or 50kg bags from Mundra Port.";
      }
      if (q.includes('millet') || q.includes('bajra') || q.includes('sorghum')) {
        return "TRIDEVA exports non-GMO Pearl Millet (Bajra) and Sorghum (Jowar) with moisture under 12%, available in 20ft/40ft containerized shipments or bulk bags.";
      }
      if (q.includes('pulse') || q.includes('dal')) {
        return "We supply machine-cleaned, polished, food-grade Indian pulses graded to international phytosanitary parameters.";
      }
      if (q.includes('port') || q.includes('mundra') || q.includes('shipment') || q.includes('delivery')) {
        return "Our primary dispatch gateway is Mundra Port (INMUN1), Gujarat. We support FOB, CFR, and CIF incoterms with standard container stuffing and phytosanitary fumigation.";
      }
      if (q.includes('price') || q.includes('quote') || q.includes('cost') || q.includes('rfq')) {
        return "You can select commodities above using 'Add to manifest +' and dispatch your specifications directly to our Trade Desk or on WhatsApp at +91 8233036995 for immediate proforma pricing.";
      }
      return "Thank you for reaching TRIDEVA EXPORTS Trade Desk. Please specify your target commodity (Isabgol, Fenugreek, Millets, or Pulses), required volume, and destination discharge port to assist you.";
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      // Append User message
      const userBubble = document.createElement('div');
      userBubble.className = 'ai-bubble user';
      userBubble.textContent = text;
      messages.appendChild(userBubble);
      input.value = '';
      scrollToBottom();

      // Simulated Commercial Processing delay
      setTimeout(() => {
        const reply = getTradeResponse(text);
        const aiBubble = document.createElement('div');
        aiBubble.className = 'ai-bubble assistant';
        aiBubble.textContent = reply;
        messages.appendChild(aiBubble);
        scrollToBottom();
      }, 550);
    });

    // Enter key sends, Shift+Enter creates line break
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    });
  }

  /* ==========================================================================
     4. DYNAMIC YEAR IN FOOTER
     ========================================================================== */
  function initDynamicYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  /* ==========================================================================
     5. SMOOTH INTER-SECTION NAVIGATION
     ========================================================================== */
  function initSmoothNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
})();
