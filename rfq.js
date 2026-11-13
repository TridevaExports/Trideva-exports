/**
 * TRIDEVA EXPORTS - Commercial RFQ Builder & WhatsApp Linker
 */
(function () {
  const selectedProducts = new Set();
  const summaryContainer = document.getElementById('summaryList');
  const whatsappBtn = document.getElementById('whatsappLink');
  const rfqForm = document.getElementById('rfqForm');
  const noticeEl = document.getElementById('notice');

  const destinationInput = document.getElementById('destination');
  const quantityInput = document.getElementById('quantity');
  const incotermInput = document.getElementById('incoterm');
  const messageInput = document.getElementById('message');

  const WHATSAPP_PHONE = '918233036995';

  function updateQuotationTray() {
    if (!summaryContainer) return;

    if (selectedProducts.size === 0) {
      summaryContainer.innerHTML = '<span style="color:var(--muted)">No commodities selected yet. Click "Add to RFQ +" above.</span>';
    } else {
      summaryContainer.innerHTML = Array.from(selectedProducts).map((product, idx) => `
        <div class="summary-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px dashed var(--line);">
          <span>✦ <strong>${product}</strong></span>
          <button type="button" data-index="${product}" style="background:none;border:none;color:#ff8d8d;cursor:pointer;font-size:16px;">&times;</button>
        </div>
      `).join('');
    }

    // Compose formatted commercial inquiry message for WhatsApp
    const productsText = selectedProducts.size > 0 ? Array.from(selectedProducts).join(', ') : 'To be confirmed';
    const dest = destinationInput?.value.trim() || 'To be advised';
    const qty = quantityInput?.value.trim() || 'To be advised';
    const incoterm = incotermInput?.value || 'FOB / CIF';
    const notes = messageInput?.value.trim() || 'Standard packaging';

    const rawMessage = 
      `*EXPORT INQUIRY - TRIDEVA EXPORTS*\n\n` +
      `*Commodities:* ${productsText}\n` +
      `*Destination Port:* ${dest}\n` +
      `*Estimated Volume:* ${qty}\n` +
      `*Preferred Incoterm:* ${incoterm}\n` +
      `*Specifications / Notes:* ${notes}\n\n` +
      `Please provide formal proforma quotation and delivery schedule.`;

    if (whatsappBtn) {
      whatsappBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(rawMessage)}`;
    }
  }

  // Handle "Add to RFQ" buttons on product cards
  document.querySelectorAll('.add-rfq').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('[data-product]');
      const product = card ? card.dataset.product : null;
      if (!product) return;

      if (selectedProducts.has(product)) {
        selectedProducts.delete(product);
        button.textContent = 'Add to RFQ +';
      } else {
        selectedProducts.add(product);
        button.textContent = 'Added ✓';
      }
      updateQuotationTray();
    });
  });

  // Handle Remove Item from Quotation Summary
  if (summaryContainer) {
    summaryContainer.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('button[data-index]');
      if (!removeBtn) return;
      const productToRemove = removeBtn.dataset.index;
      selectedProducts.delete(productToRemove);

      // Reset card button label
      document.querySelectorAll(`[data-product="${productToRemove}"] .add-rfq`).forEach(btn => {
        btn.textContent = 'Add to RFQ +';
      });

      updateQuotationTray();
    });
  }

  // Product Category Filters
  document.querySelectorAll('.filter').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterType = tab.dataset.filter;
      document.querySelectorAll('.card').forEach((card) => {
        if (filterType === 'all' || card.dataset.category === filterType) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Real-time input listeners to update WhatsApp message draft
  [destinationInput, quantityInput, incotermInput, messageInput].forEach(field => {
    if (field) field.addEventListener('input', updateQuotationTray);
  });

  // Form submission: sends to Cloud API if available, opens WhatsApp link as primary guarantee
  if (rfqForm) {
    rfqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      updateQuotationTray();

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

      // Open WhatsApp pre-filled window
      if (whatsappBtn && whatsappBtn.href) {
        window.open(whatsappBtn.href, '_blank', 'noopener,noreferrer');
      }
    });
  }

  // Global helper to select product from anywhere
  window.selectCommodityForRFQ = function (productName) {
    selectedProducts.add(productName);
    document.querySelectorAll(`[data-product="${productName}"] .add-rfq`).forEach(btn => {
      btn.textContent = 'Added ✓';
    });
    updateQuotationTray();
    const rfqSec = document.getElementById('rfq');
    if (rfqSec) rfqSec.scrollIntoView({ behavior: 'smooth' });
  };

  updateQuotationTray();
})();
