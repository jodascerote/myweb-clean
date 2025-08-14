// netlify/functions/contact.js
// Uses Nodemailer (SMTP) to send your contact form email.

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: String(process.env.EMAIL_SECURE || 'false') === 'true', // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Accept JSON or x-www-form-urlencoded
  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    const qs = new URLSearchParams(event.body || '');
    data = Object.fromEntries(qs.entries());
  }

  const { name, email, message } = data;
  if (!name || !email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'All fields required.' }) };
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${String(message).replace(/\n/g,'<br/>')}</p>
      `,
    });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Mailer error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not send.' }) };
  }
};
