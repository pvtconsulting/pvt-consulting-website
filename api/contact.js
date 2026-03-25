const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sanitize = (str) =>
  String(str || '').slice(0, 2000).replace(/</g, '&lt;').replace(/>/g, '&gt;');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, company, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { error } = await resend.emails.send({
      from: 'PVT Consulting <onboarding@resend.dev>',
      to: ['pvt@pedrovantol.com'],
      reply_to: email,
      subject: `New inquiry from ${sanitize(name)}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
          <div style="background:#1e3a5f;padding:24px 32px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;color:#f8fafc;font-size:20px;">New Contact Form Submission</h2>
            <p style="margin:4px 0 0;color:#94a3b8;font-size:14px;">pvtconsulting.com</p>
          </div>
          <div style="background:#f8fafc;padding:24px 32px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0;">
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr>
                <td style="padding:8px 16px 8px 0;font-weight:600;color:#475569;white-space:nowrap;vertical-align:top;">Name</td>
                <td style="padding:8px 0;">${sanitize(name)}</td>
              </tr>
              <tr>
                <td style="padding:8px 16px 8px 0;font-weight:600;color:#475569;vertical-align:top;">Email</td>
                <td style="padding:8px 0;"><a href="mailto:${sanitize(email)}" style="color:#0284c7;">${sanitize(email)}</a></td>
              </tr>
              <tr>
                <td style="padding:8px 16px 8px 0;font-weight:600;color:#475569;vertical-align:top;">Company</td>
                <td style="padding:8px 0;">${sanitize(company) || '—'}</td>
              </tr>
            </table>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
            <p style="font-weight:600;color:#475569;margin:0 0 8px;">Message</p>
            <p style="white-space:pre-wrap;background:#fff;padding:16px;border-radius:6px;border:1px solid #e2e8f0;margin:0;line-height:1.6;">${sanitize(message)}</p>
            <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">Reply directly to this email to respond to ${sanitize(name)}.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
