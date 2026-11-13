/**
 * TRIDEVA EXPORTS - Application Orchestration & AI Trade Desk Client
 */
(function () {
  // Year stamp
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Floating AI Assistant Elements
  const launcher = document.getElementById('aiLauncher');
  const windowModal = document.getElementById('aiWindow');
  const closeBtn = document.getElementById('aiClose');
  const form = document.getElementById('aiForm');
  const input = document.getElementById('aiInput');
  const messagesBox = document.getElementById('aiMessages');

  if (!launcher || !windowModal || !form) return;

  const conversationHistory = [];

  launcher.addEventListener('click', () => {
    windowModal.classList.toggle('open');
    if (windowModal.classList.contains('open') && input) {
      input.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      windowModal.classList.remove('open');
    });
  }

  function appendChatBubble(text, role) {
    const bubble = document.createElement('div');
    bubble.className = `msg ${role}`;
    bubble.textContent = text;
    messagesBox.appendChild(bubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    return bubble;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    appendChatBubble(query, 'user');
    conversationHistory.push({ role: 'user', content: query });
    input.value = '';

    const assistantBubble = appendChatBubble('Consulting trade desk...', 'bot');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory.slice(-20)
        })
      });

      if (!response.ok || !response.body) throw new Error('API unavailable');

      assistantBubble.textContent = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.replace('data: ', '').trim();
            if (raw === '[DONE]') break;
            try {
              const parsed = JSON.parse(raw);
              if (parsed.token) {
                streamText += parsed.token;
                assistantBubble.textContent = streamText;
                messagesBox.scrollTop = messagesBox.scrollHeight;
              }
            } catch (_) {}
          }
        }
      }

      conversationHistory.push({ role: 'assistant', content: streamText });
    } catch (_) {
      // Local Intelligent Trade Desk Fallback when running without OpenAI keys
      const q = query.toLowerCase();
      let fallbackText = '';

      if (q.includes('isabgol') || q.includes('psyllium')) {
        fallbackText = 'TRIDEVA EXPORTS supplies Isabgol (Psyllium Husk & Powder) sourced from Rajasthan and Gujarat belts. Export packaging is available in multi-wall paper bags or PP bags with containerized dispatch via Mundra Port.';
      } else if (q.includes('fenugreek') || q.includes('methi')) {
        fallbackText = 'We supply machine-cleaned Indian Fenugreek Seeds. Specific purity grades, moisture thresholds, and packaging (25/50 KG) are confirmed per export contract.';
      } else if (q.includes('millet') || q.includes('bajra')) {
        fallbackText = 'Indian Millets (Pearl/Sorghum) are sourced directly from Rajasthan agricultural regions for commercial food ingredient and wholesale trade.';
      } else if (q.includes('port') || q.includes('loading')) {
        fallbackText = 'Our primary western gateway sea port is Mundra Port (Gujarat), providing direct container liner connectivity to the Middle East, Europe, and Southeast Asia.';
      } else {
        fallbackText = 'Namaste. For firm quotations on Isabgol, Fenugreek, Millets, or Pulses, please enter your required volume in the RFQ builder or reach us directly at info@tridevaglobalexporter.com or +91 8233036995.';
      }

      assistantBubble.textContent = fallbackText;
      conversationHistory.push({ role: 'assistant', content: fallbackText });
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  });
})();
