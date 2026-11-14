/**
 * TRIDEVA EXPORTS
 * Commercial RFQ Builder and WhatsApp Linker
 */

(function () {
  "use strict";

  /*
   * Stores selected products.
   * A Set automatically prevents duplicate products.
   */
  const selectedProducts = new Set();

  const summaryContainer =
    document.getElementById("summaryList");

  const whatsappBtn =
    document.getElementById("whatsappLink");

  const rfqForm =
    document.getElementById("rfqForm");

  const noticeEl =
    document.getElementById("notice");

  const destinationInput =
    document.getElementById("destination");

  const quantityInput =
    document.getElementById("quantity");

  const incotermInput =
    document.getElementById("incoterm");

  const messageInput =
    document.getElementById("message");

  const WHATSAPP_PHONE = "918233036995";

  /*
   * Prevent product names from inserting unwanted HTML
   * into the RFQ summary.
   */
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /*
   * Updates:
   * - The RFQ summary
   * - The WhatsApp message
   * - The floating RFQ tray count
   */
  function updateQuotationTray() {
    /*
     * Tell app.js how many products are selected.
     * This controls the floating RFQ tray.
     */
    window.dispatchEvent(
      new CustomEvent("updateRFQCount", {
        detail: selectedProducts.size
      })
    );

    /*
     * Update the RFQ summary inside the form.
     */
    if (summaryContainer) {
      if (selectedProducts.size === 0) {
        summaryContainer.innerHTML =
          '<span style="color:var(--muted)">No commodities selected yet. Click "Add to RFQ +" above.</span>';
      } else {
        summaryContainer.innerHTML =
          Array.from(selectedProducts)
            .map((product) => {
              const safeProduct =
                escapeHtml(product);

              return `
                <div
                  class="summary-item"
                  style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    padding:8px 0;
                    border-bottom:1px dashed var(--line);
                  "
                >
                  <span>
                    ✦ <strong>${safeProduct}</strong>
                  </span>

                  <button
                    type="button"
                    data-product-remove="${safeProduct}"
                    aria-label="Remove ${safeProduct}"
                    style="
                      background:none;
                      border:none;
                      color:#ff8d8d;
                      cursor:pointer;
                      font-size:16px;
                    "
                  >
                    &times;
                  </button>
                </div>
              `;
            })
            .join("");
      }
    }

    /*
     * Prepare the WhatsApp message.
     */
    const productsText =
      selectedProducts.size > 0
        ? Array.from(selectedProducts).join(", ")
        : "To be confirmed";

    const destination =
      destinationInput?.value.trim() ||
      "To be advised";

    const quantity =
      quantityInput?.value.trim() ||
      "To be advised";

    const incoterm =
      incotermInput?.value ||
      "FOB / CIF";

    const notes =
      messageInput?.value.trim() ||
      "Standard packaging";

    const rawMessage =
      `*EXPORT INQUIRY - TRIDEVA EXPORTS*\n\n` +
      `*Commodities:* ${productsText}\n` +
      `*Destination Port:* ${destination}\n` +
      `*Estimated Volume:* ${quantity}\n` +
      `*Preferred Incoterm:* ${incoterm}\n` +
      `*Specifications / Notes:* ${notes}\n\n` +
      `Please provide formal proforma quotation and delivery schedule.`;

    /*
     * Update WhatsApp link.
     */
    if (whatsappBtn) {
      whatsappBtn.href =
        `https://wa.me/${WHATSAPP_PHONE}?text=` +
        encodeURIComponent(rawMessage);
    }
  }

  /*
   * Add product buttons.
   *
   * Each product card should look like:
   *
   * <article data-product="Cardamom">
   *   <button class="add-rfq">
   *     Add to RFQ +
   *   </button>
   * </article>
   */
  document.querySelectorAll(".add-rfq")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const card =
          button.closest("[data-product]");

        const product =
          card?.dataset.product;

        if (!product) {
          return;
        }

        if (selectedProducts.has(product)) {
          selectedProducts.delete(product);
          button.textContent = "Add to RFQ +";
        } else {
          selectedProducts.add(product);
          button.textContent = "Added ✓";
        }

        updateQuotationTray();
      });
    });

  /*
   * Remove products from the RFQ summary.
   */
  if (summaryContainer) {
    summaryContainer.addEventListener(
      "click",
      (event) => {
        const removeButton =
          event.target.closest(
            "button[data-product-remove]"
          );

        if (!removeButton) {
          return;
        }

        const productToRemove =
          removeButton.dataset.productRemove;

        if (!productToRemove) {
          return;
        }

        selectedProducts.delete(
          productToRemove
        );

        /*
         * Reset matching product buttons.
         */
        document.querySelectorAll(".add-rfq")
          .forEach((button) => {
            const card =
              button.closest("[data-product]");

            if (
              card &&
              card.dataset.product ===
                productToRemove
            ) {
              button.textContent =
                "Add to RFQ +";
            }
          });

        updateQuotationTray();
      }
    );
  }

  /*
   * Product category filters.
   *
   * Supports both:
   * - .filter
   * - .filter-btn
   */
  document.querySelectorAll(
    ".filter, .filter-btn"
  ).forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(
        ".filter, .filter-btn"
      ).forEach((item) => {
        item.classList.remove("active");
      });

      tab.classList.add("active");

      const filterType =
        tab.dataset.filter || "all";

      document.querySelectorAll(".card")
        .forEach((card) => {
          const matches =
            filterType === "all" ||
            card.dataset.category ===
              filterType;

          card.style.display =
            matches ? "flex" : "none";
        });
    });
  });

  /*
   * Update WhatsApp message while the user types.
   */
  [
    destinationInput,
    quantityInput,
    incotermInput,
    messageInput
  ]
    .filter(Boolean)
    .forEach((field) => {
      field.addEventListener(
        "input",
        updateQuotationTray
      );

      field.addEventListener(
        "change",
        updateQuotationTray
      );
    });

  /*
   * Submit RFQ form.
   */
  if (rfqForm) {
    rfqForm.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        updateQuotationTray();

        const payload = {
          name:
            document.getElementById("name")
              ?.value || "",

          company:
            document.getElementById("company")
              ?.value || "",

          email:
            document.getElementById("email")
              ?.value || "",

          destination:
            destinationInput?.value || "",

          quantity:
            quantityInput?.value || "",

          incoterm:
            incotermInput?.value || "",

          products:
            Array.from(selectedProducts),

          message:
            messageInput?.value || ""
        };

        if (noticeEl) {
          noticeEl.textContent =
            "Inquiry prepared. Opening WhatsApp to connect with TRIDEVA Trade Desk...";

          noticeEl.classList.add("show");
        }

        /*
         * Optional API request.
         * If the API does not exist, the website still works.
         */
        try {
          await fetch("/api/whatsapp-send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
        } catch (error) {
          /*
           * Ignore API errors because WhatsApp
           * remains the primary submission method.
           */
        }

        /*
         * Open WhatsApp with the prepared message.
         */
        if (
          whatsappBtn &&
          whatsappBtn.href
        ) {
          window.open(
            whatsappBtn.href,
            "_blank",
            "noopener,noreferrer"
          );
        }
      }
    );
  }

  /*
   * Allows other parts of the website to select
   * a product programmatically.
   */
  window.selectCommodityForRFQ =
    function (productName) {
      if (!productName) {
        return;
      }

      selectedProducts.add(productName);

      document.querySelectorAll(".add-rfq")
        .forEach((button) => {
          const card =
            button.closest("[data-product]");

          if (
            card &&
            card.dataset.product ===
              productName
          ) {
            button.textContent = "Added ✓";
          }
        });

      updateQuotationTray();

      const rfqSection =
        document.getElementById("rfq");

      if (rfqSection) {
        rfqSection.scrollIntoView({
          behavior: "smooth"
        });
      }
    };

  /*
   * Start with an empty RFQ.
   */
  updateQuotationTray();
})();
