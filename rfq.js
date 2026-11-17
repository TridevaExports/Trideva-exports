/**
 * TRIDEVA EXPORTS — COMMERCIAL RFQ ENGINE & DIGITAL TRADE MANIFEST
 * Product Selection, Dynamic Category Filtering, Real-time WhatsApp Linker
 */

(function () {
  'use strict';

  const selectedProducts = new Set();

  const summaryContainer = document.getElementById('summaryList');
  const manifestCountEl = document.getElementById('manifestCount');
  const whatsappBtn = document.getElementById('whatsappLink');
  const rfqForm = document.getElementById('rfqForm');
  const noticeEl = document.getElementById('notice');

  const destinationInput = document.getElementById('destination');
  const quantityInput = document.getElementById('quantity');
  const incotermInput = document.getElementById('incoterm');
  const messageInput = document.getElementById('message');

  const WHATSAPP_PHONE = '918233036995';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     UPDATE QUOTATION TRAY & MANIFEST
     ========================================================================== */
  function updateManifestTray() {
    const count = selectedProducts.size;

    // Update manifest counter badge
    if (manifestCountEl) {
      manifestCountEl.textContent = String(count);
    }

    // Update the manifest list inside the left console
    if (summaryContainer) {
      if (count === 0) {
        summaryContainer.innerHTML = '<span class="summary-empty">No commodities selected yet. Click "Add to manifest +" above.</span>';
      } else {
        summaryContainer.innerHTML = Array.from(selectedProducts)
          .map((prod) => {
            const safe = escapeHtml(prod);
            return `
              <div class="summary-item">
                <span>✦ <strong>${safe}</strong></span>
                <button type="button" data-remove="${safe}" aria-label="Remove ${safe}">&times;</button>
              </div>
            `;
          })
          .join('');
      }
    }

    // Compose formatted commercial WhatsApp dispatch message
    const productsText = count > 0 ? Array.from(selectedProducts).join(', ') : 'To be confirmed';
    const dest = destinationInput?.value.trim() || 'To be advised';
    const qty = quantityInput?.value.trim() || 'To be advised';
    const incoterm = incotermInput?.value || 'FOB (Mundra)';
    const notes = messageInput?.value.trim() || 'Standard export packaging requested';

    const rawMessage =
      `*COMMERCIAL INQUIRY — TRIDEVA EXPORTS*\n` +
      `──────────────────────────\n` +
      `*Selected Commodities:* ${productsText}\n` +
      `*Discharge Port:* ${dest}\n` +
      `*Estimated Volume:* ${qty}\n` +
      `*Preferred Incoterm:* ${incoterm}\n` +
      `*Packaging & Specifications:* ${notes}\n` +
      `──────────────────────────\n` +
      `Please provide formal proforma quotation and dispatch timeline.`;

    if (whatsappBtn) {
      whatsappBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(rawMessage)}`;
    }
  }

  /* ==========================================================================
     HANDLE "ADD TO MANIFEST" BUTTONS
     ========================================================================== */
  document.querySelectorAll('.add-rfq').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('[data-product]');
      const product = card?.dataset.product;
      if (!product) return;

      if (selectedProducts.has(product)) {
        selectedProducts.delete(product);
        button.innerHTML = 'Add to manifest <span>+</span>';
        button.classList.remove('btn-gold');
        button.classList.add('btn-outline');
      } else {
        selectedProducts.add(product);
        button.innerHTML = 'Added to manifest <span>✓</span>';
        button.classList.remove('btn-outline');
        button.classList.add('btn-gold');
      }

      updateManifestTray();
    });
  });

  /* ==========================================================================
     HANDLE REMOVE ITEM FROM MANIFEST CONSOLE
     ========================================================================== */
  if (summaryContainer) {
    summaryContainer.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('button[data-remove]');
      if (!removeBtn) return;

      const product = removeBtn.dataset.remove;
      if (!product) return;

      selectedProducts.delete(product);

      // Reset corresponding card button label
      document.querySelectorAll(`[data-product="${product}"] .add-rfq`).forEach((btn) => {
        btn.innerHTML = 'Add to manifest <span>+</span>';
        btn.classList.remove('btn-gold');
        btn.classList.add('btn-outline');
      });

      updateManifestTray();
    });
  }

  /* ==========================================================================
     PRODUCT CATEGORY FILTERS
     ========================================================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterButtons.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filterType = tab.dataset.filter || 'all';

      document.querySelectorAll('.commodity-card').forEach((card) => {
        const matches = filterType === 'all' || card.dataset.category === filterType;
        card.style.display = matches ? 'flex' : 'none';
      });
    });
  });

  /* ==========================================================================
     REAL-TIME FIELD INPUT LISTENERS
     ========================================================================== */
  [destinationInput, quantityInput, incotermInput, messageInput].filter(Boolean).forEach((input) => {
    input.addEventListener('input', updateManifestTray);
    input.addEventListener('change', updateManifestTray);
  });

  /* ==========================================================================
     FORM SUBMIT DISPATCH
     ========================================================================== */
  if (rfqForm) {
    rfqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      updateManifestTray();

      const payload = {
        name: document.getElementById('name')?.value || '',
        company: document.getElementById('company')?.value || '',
        email: document.getElementById('email')?.value || '',
        destination: destinationInput?.value || '',
        quantity: quantityInput?.value || '',
        incoterm: incotermInput?.value || '',
        products: Array.from(selectedProducts),
        message: messageInput?.value || ''
      };

      if (noticeEl) {
        noticeEl.textContent = 'Inquiry prepared. Opening WhatsApp to connect with TRIDEVA Trade Desk...';
        noticeEl.classList.add('show');
      }

      // Optional async ping to Cloud API endpoint
      try {
        fetch('/api/whatsapp-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (_) {}

      // Direct WhatsApp dispatch
      if (whatsappBtn?.href) {
        window.open(whatsappBtn.href, '_blank', 'noopener,noreferrer');
      }
    });
  }

  /* ==========================================================================
     GLOBAL HELPER TO SELECT COMMODITY PROGRAMMATICALLY
     ========================================================================== */
  window.selectCommodityForRFQ = function (productName) {
    if (!productName) return;
    selectedProducts.add(productName);

    document.querySelectorAll(`[data-product="${productName}"] .add-rfq`).forEach((btn) => {
      btn.innerHTML = 'Added to manifest <span>✓</span>';
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-gold');
    });

    updateManifestTray();

    const rfqSec = document.getElementById('rfq');
    if (rfqSec) {
      rfqSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Initial render
  updateManifestTray();
})();
