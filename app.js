/* =========================================================
   DIGITAL MARITIME MANIFEST
   app.js
   ========================================================= */

(() => {
  "use strict";

  /* -------------------------
     Global Helpers
  -------------------------- */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  /* -------------------------
     Current Year
  -------------------------- */

  const currentYear = $("#currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* -------------------------
     Scroll Reveal
  -------------------------- */

  const revealElements = $$("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("revealed");
    });
  }

  /* -------------------------
     Active Navigation
  -------------------------- */

  const navigationLinks = $$(".nav-links a");
  const navigatedSections = $$("main section[id]");

  function updateActiveNavigation() {
    const scrollPosition = window.scrollY + 180;
    let activeSection = "";

    navigatedSections.forEach((section) => {
      if (scrollPosition >= section.offsetTop) {
        activeSection = section.id;
      }
    });

    navigationLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle(
        "active",
        href === `#${activeSection}`
      );
    });
  }

  window.addEventListener(
    "scroll",
    updateActiveNavigation,
    { passive: true }
  );

  updateActiveNavigation();

  /* -------------------------
     Smooth Anchor Navigation
  -------------------------- */

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = $(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  /* -------------------------
     Unified 3D Tilt Engine
  -------------------------- */

  const tiltElements = $$("[data-tilt]");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const supportsTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;

  if (!prefersReducedMotion && !supportsTouch) {
    tiltElements.forEach((element) => {
      let frameRequested = false;

      element.addEventListener(
        "pointermove",
        (event) => {
          const bounds = element.getBoundingClientRect();

          const pointerX =
            ((event.clientX - bounds.left) / bounds.width) * 100;

          const pointerY =
            ((event.clientY - bounds.top) / bounds.height) * 100;

          const normalizedX =
            ((event.clientX - bounds.left) / bounds.width) * 2 - 1;

          const normalizedY =
            ((event.clientY - bounds.top) / bounds.height) * 2 - 1;

          const rotateX = normalizedY * -5;
          const rotateY = normalizedX * 7;

          element.style.setProperty(
            "--pointer-x",
            `${pointerX}%`
          );

          element.style.setProperty(
            "--pointer-y",
            `${pointerY}%`
          );

          if (frameRequested) {
            return;
          }

          frameRequested = true;

          requestAnimationFrame(() => {
            element.style.transform = `
              perspective(1000px)
              rotateX(${rotateX}deg)
              rotateY(${rotateY}deg)
              translateZ(0)
            `;

            frameRequested = false;
          });
        },
        { passive: true }
      );

      element.addEventListener("pointerleave", () => {
        element.style.transform = "";
        element.style.removeProperty("--pointer-x");
        element.style.removeProperty("--pointer-y");
      });
    });
  }

  /* -------------------------
     RFQ Form
  -------------------------- */

  const rfqForm = $("#rfqForm");
  const submitButton = $("#submitBtn");
  const whatsappLink = $("#whatsappLink");
  const formStatus = $("#formStatus");

  /*
   * Replace this number with your WhatsApp business number.
   * Use international format without +, spaces, or brackets.
   *
   * Example:
   * const whatsappNumber = "15551234567";
   */
  const whatsappNumber = "919982755536";

  function getFormData() {
    if (!rfqForm) {
      return {};
    }

    const formData = new FormData(rfqForm);

    return {
      fullName: String(formData.get("fullName") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      origin: String(formData.get("origin") || "").trim(),
      destination: String(formData.get("destination") || "").trim(),
      cargoType: String(formData.get("cargoType") || "").trim(),
      quantity: String(formData.get("quantity") || "").trim(),
      cargoDetails: String(formData.get("cargoDetails") || "").trim(),
      additionalNotes: String(
        formData.get("additionalNotes") || ""
      ).trim()
    };
  }

  function createWhatsAppMessage(data) {
    return [
      "MARITIME RFQ REQUEST",
      "",
      `Name: ${data.fullName || "Not provided"}`,
      `Company: ${data.company || "Not provided"}`,
      `Email: ${data.email || "Not provided"}`,
      `Phone: ${data.phone || "Not provided"}`,
      "",
      `Origin: ${data.origin || "Not provided"}`,
      `Destination: ${data.destination || "Not provided"}`,
      `Cargo type: ${data.cargoType || "Not provided"}`,
      `Quantity / volume: ${data.quantity || "Not provided"}`,
      "",
      `Cargo details: ${data.cargoDetails || "Not provided"}`,
      "",
      `Additional notes: ${
        data.additionalNotes || "None"
      }`
    ].join("\n");
  }

  function updateWhatsAppLink() {
    if (!whatsappLink || !rfqForm) {
      return;
    }

    const formData = getFormData();
    const message = createWhatsAppMessage(formData);

    const encodedMessage = encodeURIComponent(message);

    whatsappLink.href =
      `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
  }

  if (rfqForm) {
    rfqForm.addEventListener("input", updateWhatsAppLink);
    rfqForm.addEventListener("change", updateWhatsAppLink);

    rfqForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!rfqForm.checkValidity()) {
        rfqForm.reportValidity();

        if (formStatus) {
          formStatus.textContent =
            "Please complete all required manifest fields.";
          formStatus.style.color = "var(--red)";
        }

        return;
      }

      const data = getFormData();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Manifest Received";
      }

      if (formStatus) {
        formStatus.textContent =
          "Your request has been prepared. Our coordination team will contact you shortly.";
        formStatus.style.color = "var(--green)";
      }

      updateWhatsAppLink();

      /*
       * This is the frontend completion state.
       * Connect this section to your backend, Formspree,
       * EmailJS, or API endpoint when required.
       */

      console.log("RFQ submission:", data);

const emailSubject = encodeURIComponent(
  "New RFQ Request - TRIDEVA EXPORTS"
);

const emailBody = encodeURIComponent(
  createWhatsAppMessage(data)
);

window.location.href =
  `mailto:info@tridevaglobalexporter.com?subject=${emailSubject}&body=${emailBody}`;
    });

    updateWhatsAppLink();
  }

  /* -------------------------
     WhatsApp Button Handling
  -------------------------- */

  if (whatsappLink) {
    whatsappLink.addEventListener("click", (event) => {
      if (!rfqForm) {
        return;
      }

      if (!rfqForm.checkValidity()) {
        event.preventDefault();
        rfqForm.reportValidity();

        if (formStatus) {
          formStatus.textContent =
            "Complete the required fields before continuing to WhatsApp.";
          formStatus.style.color = "var(--gold)";
        }

        return;
      }

      updateWhatsAppLink();
    });
  }

  /* -------------------------
     AI Assistant
  -------------------------- */

  const aiLauncher = $("#aiLauncher");
  const aiWindow = $("#aiWindow");
  const aiClose = $("#aiClose");
  const aiForm = $("#aiForm");
  const aiInput = $("#aiInput");
  const aiMessages = $("#aiMessages");

  function openAssistant() {
    if (!aiWindow || !aiLauncher) {
      return;
    }

    aiWindow.classList.add("active");
    aiWindow.setAttribute("aria-hidden", "false");
    aiLauncher.setAttribute("aria-expanded", "true");

    if (aiInput) {
      window.setTimeout(() => {
        aiInput.focus();
      }, 250);
    }
  }

  function closeAssistant() {
    if (!aiWindow || !aiLauncher) {
      return;
    }

    aiWindow.classList.remove("active");
    aiWindow.setAttribute("aria-hidden", "true");
    aiLauncher.setAttribute("aria-expanded", "false");
  }

  function addAssistantMessage(message, type = "assistant") {
    if (!aiMessages) {
      return;
    }

    const messageElement = document.createElement("div");

    messageElement.className =
      `ai-message${type === "user" ? " user" : ""}`;

    messageElement.textContent = message;

    aiMessages.appendChild(messageElement);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function getAssistantResponse(message) {
    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes("quote") ||
      normalizedMessage.includes("rfq") ||
      normalizedMessage.includes("price")
    ) {
      return "To request a quote, complete the Digital Maritime Manifest below with your origin, destination, cargo type, quantity, and shipment requirements.";
    }

    if (
      normalizedMessage.includes("cargo") ||
      normalizedMessage.includes("shipment")
    ) {
      return "Please provide the cargo type, volume or quantity, origin, destination, preferred timing, and any special handling requirements.";
    }

    if (
      normalizedMessage.includes("route") ||
      normalizedMessage.includes("shipping")
    ) {
      return "Our route intelligence process reviews the origin, destination, cargo profile, timing, and operational constraints before recommending the next movement.";
    }

    if (
      normalizedMessage.includes("whatsapp") ||
      normalizedMessage.includes("contact")
    ) {
      return "You can submit the manifest first, then continue the conversation through WhatsApp using the button in the RFQ console.";
    }

    if (
      normalizedMessage.includes("hello") ||
      normalizedMessage.includes("hi") ||
      normalizedMessage.includes("hey")
    ) {
      return "Hello. Tell me whether you need a quote, route guidance, cargo coordination, or help preparing your shipment request.";
    }

    return "I can help with RFQs, cargo requirements, route planning, freight coordination, and the information needed for your next maritime movement.";
  }

  if (aiLauncher) {
    aiLauncher.addEventListener("click", () => {
      const isOpen =
        aiWindow && aiWindow.classList.contains("active");

      if (isOpen) {
        closeAssistant();
      } else {
        openAssistant();
      }
    });
  }

  if (aiClose) {
    aiClose.addEventListener("click", closeAssistant);
  }

  if (aiForm) {
    aiForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!aiInput) {
        return;
      }

      const message = aiInput.value.trim();

      if (!message) {
        return;
      }

      addAssistantMessage(message, "user");
      aiInput.value = "";

      window.setTimeout(() => {
        addAssistantMessage(
          getAssistantResponse(message),
          "assistant"
        );
      }, 420);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAssistant();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !aiWindow ||
      !aiLauncher ||
      !aiWindow.classList.contains("active")
    ) {
      return;
    }

    const clickedInsideWindow = aiWindow.contains(event.target);
    const clickedLauncher = aiLauncher.contains(event.target);

    if (!clickedInsideWindow && !clickedLauncher) {
      closeAssistant();
    }
  });

  /* -------------------------
     Optional Gyroscope Tilt
  -------------------------- */

  if (
    !prefersReducedMotion &&
    supportsTouch &&
    "DeviceOrientationEvent" in window
  ) {
    const mobileTiltElements = $$("[data-tilt]");

    const handleDeviceOrientation = (event) => {
      const gamma = Number(event.gamma || 0);
      const beta = Number(event.beta || 0);

      const rotateY = Math.max(
        -5,
        Math.min(5, gamma * 0.18)
      );

      const rotateX = Math.max(
        -4,
        Math.min(4, (beta - 45) * 0.08)
      );

      mobileTiltElements.forEach((element) => {
        element.style.transform = `
          perspective(1000px)
          rotateX(${-rotateX}deg)
          rotateY(${rotateY}deg)
        `;
      });
    };

    const enableOrientation = () => {
      window.addEventListener(
        "deviceorientation",
        handleDeviceOrientation,
        { passive: true }
      );
    };

    /*
     * iOS requires permission to access device orientation.
     * The listener is enabled directly where permission is not required.
     */
    if (
      typeof DeviceOrientationEvent.requestPermission ===
      "function"
    ) {
      document.addEventListener(
        "click",
        () => {
          DeviceOrientationEvent.requestPermission()
            .then((permission) => {
              if (permission === "granted") {
                enableOrientation();
              }
            })
            .catch(() => {
              // Device orientation is optional.
            });
        },
        { once: true }
      );
    } else {
      enableOrientation();
    }
  }

})();
