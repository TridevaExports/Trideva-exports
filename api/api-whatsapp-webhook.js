import crypto from 'crypto';

/**
 * Meta WhatsApp Webhook Handler with Signature Verification
 */
export default async function handler(req, res) {
  // 1. Meta Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === expectedToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Verification token mismatch');
  }

  // 2. Inbound Event Handler (POST)
  if (req.method === 'POST') {
    const appSecret = process.env.META_APP_SECRET;

    // Verify SHA-256 Signature if appSecret is configured
    if (appSecret) {
      const signature = req.headers['x-hub-signature-256'];
      if (!signature) {
        return res.status(401).send('Missing webhook signature');
      }

      const hmac = crypto.createHmac('sha256', appSecret);
      const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

      if (signature !== digest) {
        return res.status(401).send('Invalid signature');
      }
    }

    // Process event safely
    const data = req.body;
    if (data?.object === 'whatsapp_business_account') {
      // Event acknowledged
      return res.status(200).json({ status: 'EVENT_RECEIVED' });
    }

    return res.status(404).send('Not Found');
  }

  return res.status(405).send('Method Not Allowed');
}
