import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

const SYSTEM_PROMPT = `
You are the AI Trade Desk Assistant for TRIDEVA EXPORTS (based in REN, Nagaur, Rajasthan - 341512, India).
Primary Gateway Loading Port: Mundra Port (Gujarat, India).
Verified Commercial Portfolio: Isabgol (Psyllium Husk & Powder), Fenugreek Seeds, Millets, and Pulses.
Registration details: GSTIN 08ABAFT0907G1ZF, Udyam No. RJ-25-0117239.
Official correspondence: info@tridevaglobalexporter.com | WhatsApp: +91 8233036995.

Behavior Guidelines:
1. Assist global importers with commodity grades, packaging choices (25/50 kg PP/paper bags), supported Incoterms (FOB, CFR, CIF), and container logistics out of Mundra Port.
2. Structure prospective demands clearly: identify commodity, quantity, target destination port, and packaging.
3. NEVER make up unverified certifications (such as APEDA, Spice Board, or ISO unless instructed). State accurately that quality parameters, laboratory testing, and phytosanitary documents are verified per contract.
4. Do not offer binding price quotes. Guide buyers to complete the RFQ form or connect via WhatsApp for formal proforma pricing.
5. Keep answers professional, concise, and aligned with B2B international trade standards.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'OpenAI API key not configured on server.' });
  }

  try {
    const { messages = [] } = req.body || {};

    const safeMessages = Array.isArray(messages)
      ? messages
          .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
          .slice(-20)
      : [];

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...safeMessages
      ]
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    });

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content || '';
      if (token) {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Unable to stream trade desk response.' });
  }
}
