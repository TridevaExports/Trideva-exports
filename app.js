/**
 * TRIDEVA EXPORTS
 * 3D card interaction, mobile navigation, RFQ tray, and device tilt.
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    init3DCards();
    initMobileNavigation();
    initRFQTray();
    initDeviceOrientation();
  }

  /*
   * 1. Mouse-controlled 3D card tilt and glare
   */
  function init3DCards() {
    const cards = document.querySelectorAll(".card, .lux-card");

    if (!cards.length || prefersReducedMotion) {
      return;
    }

    cards.forEach((card) => {
      let animationFrame;

      function resetCard() {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--mouse-x", "50%");
        card.style.setProperty("--mouse-y", "50%");
      }

      function moveCard(event) {
        /*
         * Gyroscope handles touch devices separately.
         * Mouse interaction is used for desktop.
         */
        if (isTouchDevice && event.pointerType !== "mouse") {
          return;
        }

        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const percentX = Math.max(
          0,
          Math.min(1, x / rect.width)
        );

        const percentY = Math.max(
          0,
          Math.min(1, y / rect.height)
        );

        const maximumTilt = 7;

        const rotateY =
          (percentX - 0.5) * maximumTilt * 2;

        const rotateX =
          (0.5 - percentY) * maximumTilt * 2;

        cancelAnimationFrame(animationFrame);

        animationFrame = requestAnimationFrame(() => {
          card.style.setProperty(
            "--rx",
            `${rotateX.toFixed(2)}deg`
          );

          card.style.setProperty(
            "--ry",
            `${rotateY.toFixed(2)}deg`
          );

          card.style.setProperty("--mouse-x", `${x}px`);
          card.style.setProperty("--mouse-y", `${y}px`);
        });
      }

      card.addEventListener("pointermove", moveCard, {
        passive: true
      });

      card.addEventListener("pointerleave", resetCard);
      card.addEventListener("pointercancel", resetCard);
    });
  }

  /*
   * 2. Mobile navigation menu
   */
  function initMobileNavigation() {
    const nav = document.querySelector(".nav");
    const navLinks = document.querySelector(".navlinks");
    const navActions = document.querySelector(".nav-actions");

    if (!navLinks || !navActions) {
      return;
    }

    let toggle = document.querySelector(
      ".mobile-nav-toggle"
    );

    /*
     * Create the mobile menu button only if it does not
     * already exist.
     */
    if (!toggle) {
      toggle = document.createElement("button");

      toggle.type = "button";
      toggle.className =
        "btn btn-outline mobile-nav-toggle";

      toggle.setAttribute(
        "aria-label",
        "Toggle navigation"
      );

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

      toggle.innerHTML = "☰";

      navActions.prepend(toggle);
    }

    toggle.addEventListener("click", () => {
      const menuIsOpen =
        navLinks.classList.toggle("show");

      toggle.setAttribute(
        "aria-expanded",
        String(menuIsOpen)
      );

      toggle.innerHTML = menuIsOpen ? "×" : "☰";
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("show");

        toggle.setAttribute(
          "aria-expanded",
          "false"
        );

        toggle.innerHTML = "☰";
      });
    });

    document.addEventListener("click", (event) => {
      if (nav && nav.contains(event.target)) {
        return;
      }

      navLinks.classList.remove("show");

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

      toggle.innerHTML = "☰";
    });
  }

  /*
   * 3. Floating RFQ tray
   *
   * This reuses an existing .rfq-tray.
   * If no tray exists, it creates one.
   */
  function initRFQTray() {
    let tray = document.querySelector(".rfq-tray");

    if (!tray) {
      tray = document.createElement("aside");

      tray.className = "rfq-tray";

      tray.setAttribute(
        "aria-label",
        "RFQ inquiry tray"
      );

      tray.innerHTML = `
        <strong class="rfq-count">0</strong>
        <span>Inquiry Tray</span>
        <a
          href="#rfq"
          class="btn btn-gold"
          style="padding:8px 16px"
        >
          Review RFQ
        </a>
      `;

      document.body.appendChild(tray);
    }

    const countElement =
      tray.querySelector(".rfq-count");

    function updateTray(event) {
      let count = 0;

      if (event && event.detail !== undefined) {
        count = Number(event.detail);
      }

      if (!Number.isFinite(count)) {
        count = 0;
      }

      count = Math.max(0, count);

      if (countElement) {
        countElement.textContent = String(count);
      }

      const shouldShow = count > 0;

      tray.hidden = false;

      tray.classList.toggle(
        "visible",
        shouldShow
      );

      tray.setAttribute(
        "aria-hidden",
        String(!shouldShow)
      );
    }

    window.addEventListener(
      "updateRFQCount",
      updateTray
    );

    /*
     * Optional helper for other scripts.
     */
    window.updateRFQTray = function (count) {
      window.dispatchEvent(
        new CustomEvent("updateRFQCount", {
          detail: count
        })
      );
    };

    /*
     * Start with an empty tray.
     */
    updateTray({ detail: 0 });
  }

  /*
   * 4. Mobile gyroscope tilt
   */
  function initDeviceOrientation() {
    if (prefersReducedMotion || !isTouchDevice) {
      return;
    }

    const cards = document.querySelectorAll(
      ".card, .lux-card"
    );

    if (
      !cards.length ||
      !("DeviceOrientationEvent" in window)
    ) {
      return;
    }

    let orientationEnabled = false;

    function applyOrientation(event) {
      if (!orientationEnabled) {
        return;
      }

      const gamma = Number(event.gamma) || 0;
      const beta = Number(event.beta) || 0;

      const rotateY = Math.max(
        -5,
        Math.min(5, gamma / 6)
      );

      const rotateX = Math.max(
        -5,
        Math.min(5, (beta - 45) / 9)
      );

      cards.forEach((card) => {
        card.style.setProperty(
          "--rx",
          `${-rotateX}deg`
        );

        card.style.setProperty(
          "--ry",
          `${rotateY}deg`
        );
      });
    }

    async function requestOrientationPermission() {
      try {
        /*
         * iPhones require permission from a user gesture.
         */
        if (
          typeof DeviceOrientationEvent.requestPermission ===
          "function"
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
        /*
         * Device orientation is optional.
         * The website continues normally if unavailable.
         */
      }
    }

    window.addEventListener(
      "touchstart",
      requestOrientationPermission,
      {
        once: true,
        passive: true
      }
    );
  }
})();
