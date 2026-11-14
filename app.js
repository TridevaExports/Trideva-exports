/**
 * TRIDEVA EXPORTS
 * 3D interaction, mobile navigation, RFQ tray, and accessibility helpers.
 */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    initCards();
    initMobileNavigation();
    initRFQTray();
    initDeviceOrientation();
  }

  /*
   * 1. Interactive 3D card tilt and specular glare
   */
  function initCards() {
    const cards = document.querySelectorAll(".card, .lux-card");

    if (!cards.length || prefersReducedMotion) {
      return;
    }

    cards.forEach((card) => {
      let frame = null;

      const resetCard = () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--mouse-x", "50%");
        card.style.setProperty("--mouse-y", "50%");
      };

      const updateCard = (event) => {
        if (isTouchDevice && event.pointerType !== "mouse") {
          return;
        }

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const percentX = Math.max(0, Math.min(1, x / rect.width));
        const percentY = Math.max(0, Math.min(1, y / rect.height));

        const maxTilt = 7;
        const rotateY = (percentX - 0.5) * maxTilt * 2;
        const rotateX = (0.5 - percentY) * maxTilt * 2;

        if (frame) {
          cancelAnimationFrame(frame);
        }

        frame = requestAnimationFrame(() => {
          card.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
          card.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
          card.style.setProperty("--mouse-x", `${x}px`);
          card.style.setProperty("--mouse-y", `${y}px`);
        });
      };

      card.addEventListener("pointermove", updateCard, {
        passive: true
      });

      card.addEventListener("pointerleave", resetCard);
      card.addEventListener("pointercancel", resetCard);
    });
  }

  /*
   * 2. Mobile navigation
   */
  function initMobileNavigation() {
    const nav = document.querySelector(".nav");
    const navLinks = document.querySelector(".navlinks");
    const navActions = document.querySelector(".nav-actions");

    if (!navLinks || !navActions) {
      return;
    }

    let toggle = document.querySelector(".mobile-nav-toggle");

    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "btn btn-outline mobile-nav-toggle";
      toggle.setAttribute("aria-label", "Toggle navigation");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = "☰";
      navActions.prepend(toggle);
    }

    toggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("show");

      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.innerHTML = isOpen ? "×" : "☰";
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("show");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = "☰";
      });
    });

    document.addEventListener("click", (event) => {
      if (!nav || nav.contains(event.target)) {
        return;
      }

      navLinks.classList.remove("show");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = "☰";
    });
  }

  /*
   * 3. RFQ tray
   *
   * Uses an existing .rfq-tray if one is already present.
   * Otherwise, creates one dynamically.
   */
  function initRFQTray() {
    let tray = document.querySelector(".rfq-tray");

    if (!tray) {
      tray = document.createElement("aside");
      tray.className = "rfq-tray";
      tray.setAttribute("aria-label", "RFQ inquiry tray");
      tray.innerHTML = `
        <strong class="rfq-count">0</strong>
        <span>Inquiry Tray</span>
        <a href="#rfq" class="btn btn-gold" style="padding:8px 16px">
          Review RFQ
        </a>
      `;

      document.body.appendChild(tray);
    }

    const countElement = tray.querySelector(".rfq-count");

    const updateTray = (event) => {
      const rawCount =
        event && event.detail !== undefined
          ? event.detail
          : 0;

      const count =
        typeof rawCount === "object"
          ? Number(rawCount.count || 0)
          : Number(rawCount);

      const safeCount = Number.isFinite(count)
        ? Math.max(0, count)
        : 0;

      if (countElement) {
        countElement.textContent = String(safeCount);
      }

      const visible = safeCount > 0;

      tray.hidden = false;
      tray.classList.toggle("visible", visible);
      tray.setAttribute("aria-hidden", String(!visible));
    };

    window.addEventListener("updateRFQCount", updateTray);

    /*
     * Allows other scripts to update the tray with:
     * window.dispatchEvent(
     *   new CustomEvent("updateRFQCount", { detail: 3 })
     * );
     */
    window.updateRFQTray = (count) => {
      window.dispatchEvent(
        new CustomEvent("updateRFQCount", {
          detail: count
        })
      );
    };

    updateTray({ detail: 0 });
  }

  /*
   * 4. Mobile gyroscope tilt
   *
   * iOS requires permission to be requested from a user gesture.
   * The first touch attempts to activate orientation tracking.
   */
  function initDeviceOrientation() {
    if (prefersReducedMotion || !isTouchDevice) {
      return;
    }

    const cards = document.querySelectorAll(".card, .lux-card");

    if (!cards.length || !("DeviceOrientationEvent" in window)) {
      return;
    }

    let orientationEnabled = false;

    const applyOrientation = (event) => {
      if (!orientationEnabled) {
        return;
      }

      const gamma = Number(event.gamma) || 0;
      const beta = Number(event.beta) || 0;

      const rotateY = Math.max(-5, Math.min(5, gamma / 6));
      const rotateX = Math.max(-5, Math.min(5, (beta - 45) / 9));

      cards.forEach((card) => {
        card.style.setProperty("--rx", `${-rotateX}deg`);
        card.style.setProperty("--ry", `${rotateY}deg`);
      });
    };

    const enableOrientation = async () => {
      try {
        if (
          typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
          const permission =
            await DeviceOrientationEvent.requestPermission();

          if (permission !== "granted") {
            return;
          }
        }

        orientationEnabled = true;
        window.addEventListener(
          "deviceorientation",
          applyOrientation,
          { passive: true }
        );
      } catch (error) {
        // Orientation is optional; fail silently.
      }
    };

    window.addEventListener("touchstart", enableOrientation, {
      once: true,
      passive: true
    });
  }
})();
