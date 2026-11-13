/**
 * WhatsApp Cloud API Secure Dispatcher
 * Sends inbound buyer RFQs directly to Trideva Exports' WhatsApp desk.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipientPhone = process.env.TRADE_DESK_WHATSAPP || '918233036995';

  if (!token || !phoneId) {
    // Cloud API not yet configured with Meta keys; return graceful status
    return res.status(200).json({ status: 'fallback_to_direct_link' });
  }

  try {
    const { name, company, email, destination, quantity, products, incoterm, message } = req.body || {};

    const formattedBody = 
      `*New RFQ from Website*\n` +
      `• *Buyer:* ${name || 'N/A'} (${company || 'N/A'})\n` +
      `• *Email:* ${email || 'N/A'}\n` +
      `• *Products:* ${Array.isArray(products) ? products.join(', ') : 'N/A'}\n` +
      `• *Volume:* ${quantity || 'N/A'}\n` +
      `• *Destination Port:* ${destination || 'N/A'}\n` +
      `• *Incoterm:* ${incoterm || 'FOB/CIF'}\n` +
      `• *Requirements:* ${message || 'Standard'}`;

    const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: { body: formattedBody }
      })
    });

    const result = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error('Meta API Error:', result);
      return res.status(502).json({ error: 'WhatsApp delivery failed', details: result });
    }

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('WhatsApp Dispatch Error:', err);
    return res.status(500).json({ error: 'Server error processing WhatsApp notification' });
  }
}
